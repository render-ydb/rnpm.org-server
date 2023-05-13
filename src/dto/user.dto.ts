import { Rule, RuleType } from '@midwayjs/validate';

export class UserDTO {
    // _id: 'org.couchdb.user:cubber',
    // name: 'your name',
    // password: 'your password',
    // email: 'your email address'
    // type: 'user',
    // roles: [],
    // date: '2023-05-13T11:53:02.223Z'
    @Rule(RuleType.string().required())
    _id: string;

    @Rule(RuleType.string().required())
    name: string;

    @Rule(RuleType.string().required())
    password: string;

    @Rule(RuleType.string())
    email: string;

    @Rule(RuleType.string().required())
    type: string;

    @Rule(RuleType.array().items(RuleType.string().allow('')))
    roles: Array<string>;

    @Rule(RuleType.string().required())
    date: string;

}