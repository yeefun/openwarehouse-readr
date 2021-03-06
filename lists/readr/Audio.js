const { Text, Relationship, File, Integer } = require('@keystonejs/fields')
const { atTracking, byTracking } = require('@keystonejs/list-plugins')
const { GCSAdapter } = require('../../lib/GCSAdapter')
const {
    admin,
    moderator,
    editor,
    allowRoles,
} = require('../../helpers/access/readr')
const cacheHint = require('../../helpers/cacheHint')

const gcsDir = 'assets/audios/'
const fileAdapter = new GCSAdapter(gcsDir)

module.exports = {
    fields: {
        name: {
            label: '標題',
            type: Text,
            isRequired: true,
        },
        file: {
            label: '檔案',
            type: File,
            adapter: fileAdapter,
            isRequired: true,
            hooks: {
                beforeChange: async ({ existingItem }) => {
                    if (existingItem && existingItem.file) {
                        await fileAdapter.delete(
                            existingItem.file.id,
                            existingItem.file.originalFilename
                        )
                    }
                },
            },
        },
        coverPhoto: {
            label: '封面照片',
            type: Relationship,
            ref: 'Image',
        },
        tags: {
            label: '標籤',
            type: Relationship,
            ref: 'Tag',
            many: true,
        },
        meta: {
            label: '中繼資料',
            type: Text,
            access: {
                create: false,
                update: false,
            },
        },
        url: {
            label: '檔案網址',
            type: Text,
            access: {
                create: false,
                update: false,
            },
        },
        duration: {
            label: '音檔長度（秒）',
            type: Text,
            access: {
                create: false,
                update: false,
            },
        },
    },
    plugins: [atTracking(), byTracking()],
    access: {
        update: allowRoles(admin, moderator, editor),
        create: allowRoles(admin, moderator, editor),
        delete: allowRoles(admin),
    },
    adminConfig: {
        defaultColumns: 'name, audio, tags, createdAt',
        defaultSort: '-createdAt',
    },
    hooks: {
        resolveInput: ({
            operation,
            existingItem,
            resolvedData,
            originalInput,
        }) => {
            if (resolvedData.file) {
                resolvedData.meta = resolvedData.file._meta
                resolvedData.url = resolvedData.file._meta.url
                resolvedData.duration = resolvedData.file._meta.duration
            }
            return resolvedData
        },

        afterDelete: async ({ existingItem }) => {
            if (existingItem.file) {
                await fileAdapter.delete(
                    existingItem.file.id,
                    existingItem.file.originalFilename
                )
            }
        },
    },
    plural: 'Audios',
    labelField: 'name',
    cacheHint: cacheHint,
}
