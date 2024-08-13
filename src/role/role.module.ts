import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import RoleModel from './role.model';

@Module({
  imports: [RoleModel],
  controllers: [RoleController],
  providers: [RoleService]
})
export class RoleModule {}
