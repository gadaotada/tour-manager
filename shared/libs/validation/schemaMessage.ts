type SchemaMessageParams = {
    message: string;
};

type SchemaInvalidTypeParams = {
    invalid_type_error: string;
};

type SchemaBooleanParams = {
    required_error: string;
    invalid_type_error: string;
};

const schemaMessage = (key: string): SchemaMessageParams => ({ message: key });

const schemaInvalidType = (key: string): SchemaInvalidTypeParams => ({
    invalid_type_error: key,
});

const schemaBoolean = (key: string): SchemaBooleanParams => ({
    required_error: key,
    invalid_type_error: key,
});

export { schemaBoolean, schemaInvalidType, schemaMessage };
