import { validate } from "validate.js";

export const validateString = (id, value) => {
    const constraints = {
        presence: { allowEmpty: false },
    };
    if (value != "") {
        constraints.format = {
            pattern: "[a-z ]+",
            flags: "i",
            message: "can only contain letters.",
        }
    }

    const validationResult = validate({ [id]: value }, { [id]: constraints });

    return validationResult && validationResult[id];
}

export const validateLength = (id, value, minLength, maxLength, allowEmpty) => {
    const constraints = {
        presence: { allowEmpty },
    };
    if (!allowEmpty || value != "") {
        constraints.length = {}

        if (minLength != null) {
            constraints.length.minimum = minLength;
        }

        if (maxLength != null) {
            constraints.length.maximum = maxLength;
        }
    }

    const validationResult = validate({ [id]: value }, { [id]: constraints });

    return validationResult && validationResult[id];
}

export const validateNumber = (id, value) => {
    const constraints = {
        presence: { allowEmpty: false },
    };
    if (value != "") {
        constraints.length = {
            minimum: 9,
            message: "must be valid."
        }
    }

    const validationResult = validate({ [id]: value }, { [id]: constraints });

    return validationResult && validationResult[id];
}

export const validateEmail = (id, value) => {
    const constraints = {
        presence: { allowEmpty: false },
    };
    if (value != "") {
        constraints.email = true
    }

    const validationResult = validate({ [id]: value }, { [id]: constraints });

    return validationResult && validationResult[id];
}

export const validatePassword = (id, value) => {
    const constraints = {
        presence: { allowEmpty: false },
    };
    if (value != "") {
        constraints.length = {
            minimum: 8,
            message: "must have atleast 8 characters."
        }
    }

    const validationResult = validate({ [id]: value }, { [id]: constraints });

    return validationResult && validationResult[id];
}