/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ConsoleLogger,
  FactoryProvider,
  Injectable,
  Provider,
} from '@nestjs/common';
import * as newRelic from 'newrelic';

import { OverriderInjector } from './overrider';
import { Constants } from 'src/constants/providers.constants';

@Injectable()
export class LoggerOverrider implements OverriderInjector {
  public inject() {
    ConsoleLogger.prototype.log = this.wrapPrototype(
      ConsoleLogger.prototype.log,
    );
    ConsoleLogger.prototype.debug = this.wrapPrototype(
      ConsoleLogger.prototype.debug,
    );
    ConsoleLogger.prototype.error = this.wrapPrototype(
      ConsoleLogger.prototype.error,
    );
    ConsoleLogger.prototype.verbose = this.wrapPrototype(
      ConsoleLogger.prototype.verbose,
    );
    ConsoleLogger.prototype.warn = this.wrapPrototype(
      ConsoleLogger.prototype.warn,
    );
  }

  private wrapPrototype(prototype: any) {
    return {
      [prototype.name]: function (...args: any[]) {
        args[0] = LoggerOverrider.getMessage(args[0], prototype.name);
        prototype.apply(this, args);
      },
    }[prototype.name];
  }

  private static getMessage(message: string, level: string) {
    const currentTracing = newRelic.getTraceMetadata();
    if (!currentTracing.traceId) return message;

    newRelic.recordLogEvent({
      message,
      timestamp: new Date().getTime(),
      level,
    });

    return `[${currentTracing.traceId}] ${message}`;
  }

  public static buildInjectors(
    injectors: Provider<OverriderInjector>[],
  ): FactoryProvider {
    return {
      provide: Constants.OVERRIDERS,
      useFactory: async (...injectors: any) => {
        for await (const injector of injectors) {
          if (injector['inject']) await injector.inject();
        }
      },
      // eslint-disable-next-line @typescript-eslint/ban-types
      inject: [...(injectors as Function[])],
    };
  }
}

export const Injectors = [LoggerOverrider];
