import { randomUUID } from 'crypto'

export class baseInterface {
    slug: string
    status: boolean
    created_at: Date
    upated_at: Date
    deleted_at: Date
}

export default {
    slug: {
        type: String,
        default: randomUUID()
    },
    status: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
        default: null
    },
    deleted_at: {
        type: Date,
        default: null
    },
}