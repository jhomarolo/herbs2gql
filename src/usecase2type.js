const { camelCase } = require('lodash')
const { schemaOptions, usecaseResponse2gql, usecaseFieldToParams } = require("./helpers/gqlConverters")
const { checker } = require('suma')
const { useCaseValidator } = require('./herbsValidator')

function usecase2type(type, useCase, resolverFunc, options) {
    const schema = schemaOptions(options)
    const validation = useCaseValidator(useCase)
    if (!checker.isEmpty(validation)) {
        const error = new Error()
        error.name = 'InvalidUseCase'
        error.message = JSON.stringify(validation)
        error.invalidArgs = validation
        throw error
    }

    const convention = schema.EnumConventions[options?.convention]

    let nameFormatted
    if (schema.customName !== '') nameFormatted = schema.customName
    else if (convention) nameFormatted = convention(useCase.description)
    else  nameFormatted = camelCase(useCase.description)

    const usecaseParams = usecaseFieldToParams(useCase, schema)
    const usecaseResponse = usecaseResponse2gql(useCase, schema.presenceOnResponse)
    
    const gql = `extend type ${type} { ${nameFormatted} ${usecaseParams}: ${usecaseResponse} }`
    const resolver = { [type]: { [nameFormatted]: resolverFunc } }

    return [gql, resolver]
}

module.exports = usecase2type


