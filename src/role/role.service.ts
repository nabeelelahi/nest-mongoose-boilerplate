import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { schema, name, RoleDTO } from './role.model';
import { BaseService } from 'src/base/base.service';

@Injectable()
export class RoleService extends BaseService {
    constructor(@InjectModel(name) override _model: Model<typeof schema>) {
        super()
    }

    override _softDelete = () => false;

    override _fillables = () => [
        'name', 'slug'
    ]

    override _beforeGetHook = (_request: Request, query: any) => {
        query.where({ slug: { $ne: 'super-admin' } })
        query.sort({ name: 'desc' })
    }

}