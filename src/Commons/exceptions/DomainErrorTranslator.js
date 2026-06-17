import InvariantError from './InvariantError.js';

/* BEFORE REFACTOR */
// const DomainErrorTranslator = {
//   translate(error) {
//     switch (error.message) {
//     case 'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY':
//       return new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada');
//     case 'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION':
//       return new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai');
//     case 'REGISTER_USER.USERNAME_LIMIT_CHAR':
//       return new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit');
//     case 'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER':
//       return new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang');
//     default:
//       return error;
//     }
//   },
// };

/* AFTER REFACTOR */
const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {
  'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'),
  'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'),
  'REGISTER_USER.USERNAME_LIMIT_CHAR': new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'),
  'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'),

  'USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan username dan password'),
  'USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('username dan password harus string'),
};

export default DomainErrorTranslator;