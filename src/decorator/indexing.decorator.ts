import { SetMetadata } from '@nestjs/common';

const IndexerDecorator = (key: string) => SetMetadata('indexer', key);
