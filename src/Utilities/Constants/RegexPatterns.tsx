const
    USERNAME_REGEX_PATTERN: string = [
        "(",
        "[a-zA-Z]{1}",
        "[a-zA-Z0-9]*",
        "[\\._\\-]{0,1}",
        "[a-zA-Z0-9]*",
        ")*",
        "[a-zA-Z]{1}",
        "[a-zA-Z0-9]*",
    ].join(""),
    MAIL_REGEX_PATTERN: string = [
        "(",
        "[a-zA-Z]{1}",
        "[a-zA-Z0-9]*",
        "[\\._\\-]{0,1}",
        "[a-zA-Z0-9]*",
        ")*",
        "[a-zA-Z0-9]{1}",
        "[@]{1}",
        "(",
        "[a-zA-Z]{1}",
        "[a-zA-Z0-9]*",
        "[_\\-]{0,1}",
        "[a-zA-Z0-9]*",
        ")*",
        "[a-zA-Z0-9]{1}",
        "[\\.]{1}",
        "([a-zA-Z]{2,})",
    ].join(""),
    USERNAME_OR_MAIL_REGEX_PATTERN: string = [
        "(",
        USERNAME_REGEX_PATTERN,
        "){0,1}",
        "(",
        MAIL_REGEX_PATTERN,
        "){0,1}",
    ].join(""),
    PASSWORD_REGEX_PATTERN: string =
        [
            "^(?=.*[a-z])",
            "(?=.*[A-Z])",
            "(?=.*[0-9])",
            "(?=.*[!@#$%^&*_=+\\-])",
            ".{8,20}$",
        ].join("");


const REGEX_PATTERNS = {
    username: USERNAME_REGEX_PATTERN,
    mail: MAIL_REGEX_PATTERN,
    usernameOrMail: USERNAME_OR_MAIL_REGEX_PATTERN,
    password: PASSWORD_REGEX_PATTERN,
};

export default REGEX_PATTERNS;