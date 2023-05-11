import gravatar = require('gravatar');
import { isAdmin } from '../lib';



// const  convertToUser = (row)=> {
//     const user = {
//       login: row.name,
//       email: row.email,
//       name: row.name,
//       html_url: 'http://cnpmjs.org/~' + row.name,
//       avatar_url: '',
//       im_url: '',
//       site_admin: isAdmin(row.name),
//       scopes: config.scopes,
//     };
//     if (row.json) {
//       var data = row.json;
//       if (data.login) {
//         // custom user
//         user = data;
//       } else {
//         // npm user
//         if (data.avatar) {
//           user.avatar_url = data.avatar;
//         }
//         if (data.fullname) {
//           user.name = data.fullname;
//         }
//         if (data.homepage) {
//           user.html_url = data.homepage;
//         }
//         if (data.twitter) {
//           user.im_url = 'https://twitter.com/' + data.twitter;
//         }
//       }
//     }
//     if (!user.avatar_url) {
//       user.avatar_url = gravatar.url(user.email, {s: '50', d: 'retro'}, true);
//     }
//     return user;
//   }

// export default class DefaultUserService {
//     async auth(userName:string,password:string) {
//         var row = yield User.auth(login, password);
//         if (!row) {
//           return null;
//         }
//         return convertToUser(row);
//     }
// }