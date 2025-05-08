export type emailValidationResult = {
    isValid: boolean;
    message: string;
}

export default function validateEmail(value: string): emailValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const domainName = /^((([0-9A-Za-z]{1}[-0-9A-z]{1,}[0-9A-Za-z]{1})|([0-9A-Za-z]{1,}))@)$/;
    const charAt =/^((([0-9A-Za-z]{1}[-0-9A-z]{1,}[0-9A-Za-z]{1})|([0-9A-Za-z]{1,})))$/;
    const whitespace = /\s+/;

    if (!emailRegex.test(String(value))) {

      if (domainName.test(String(value))) {
        return {isValid: false, message: "Adress email must contains domain name after @"};
    }

    if (charAt.test(String(value))) {
        return {isValid: false, message: "Please enter '@' between part and domain name"};
    }
    if (whitespace.test(String(value))) {
        return {isValid: false, message: "Please delete trims!"};
    }
    if(!value) {
        return {isValid: false, message: "Please write email!"};
    }
    return {isValid: false, message: "Incorrect format email!"};

    }


    return {isValid: true, message: ""}
}
