import { DynamicModule } from '@nestjs/common';
import { DefaultConfig } from 'src/config/default.config';

export class NewRelicModule {
  static async forRoot(defaultConfig: DefaultConfig): Promise<DynamicModule> {
    const config = Object.assign(DefaultConfig, defaultConfig);

    return {
      global: true,
      module: NewRelicModule,
      providers: [],
    };
  }
}
