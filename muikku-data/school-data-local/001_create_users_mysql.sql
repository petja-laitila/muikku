/* Andreas Fuccibani */

insert into UserEntity (id, archived) values (1, false);
insert into EnvironmentUser (id, archived, role_id, user_id) values (1, false, 2, 1);
insert into LocalUser (id, firstName, lastName, roleId, archived) values (1, 'Andreas', 'Fuccibani', 2, false);
insert into LocalUserEmail (user_id, address, archived) values (1, 'andreas.fuccibani@superdupermangobanana.fi', false);
insert into InternalAuth (id, password, userEntityId) values (1, md5(md5('qwe')), 1);
insert into UserSchoolDataIdentifier (identifier, dataSource_id, userEntity_id) values ('1', (select id from SchoolDataSource where identifier = 'LOCAL'), 1);

insert into UserEntity (id, archived) values (2, false);
insert into EnvironmentUser (id, archived, role_id, user_id) values (2, false, 4, 2);
insert into LocalUser (id, firstName, lastName, roleId, archived) values (2, 'Student', 'No1', 4, false);
insert into LocalUserEmail (user_id, address, archived) values (2, 'st1@oo.fi', false);
insert into InternalAuth (id, password, userEntityId) values (2, md5(md5('qwe')), 2);
insert into UserSchoolDataIdentifier (identifier, dataSource_id, userEntity_id) values ('2', (select id from SchoolDataSource where identifier = 'LOCAL'), 2);

insert into UserEntity (id, archived) values (3, false);
insert into EnvironmentUser (id, archived, role_id, user_id) values (3, false, 4, 3);
insert into LocalUser (id, firstName, lastName, roleId, archived) values (3, 'Student', 'No2', 4, false);
insert into LocalUserEmail (user_id, address, archived) values (3, 'st2@oo.fi', false);
insert into InternalAuth (id, password, userEntityId) values (3, md5(md5('qwe')), 3);
insert into UserSchoolDataIdentifier (identifier, dataSource_id, userEntity_id) values ('3', (select id from SchoolDataSource where identifier = 'LOCAL'), 3);

insert into UserEntity (id, archived) values (4, false);
insert into EnvironmentUser (id, archived, role_id, user_id) values (4, false, 7, 4);
insert into LocalUser (id, firstName, lastName, roleId, archived) values (4, 'Liisa', 'Linjanvetäjä', 7, false);
insert into LocalUserEmail (user_id, address, archived) values (4, 'linja@oo.fi', false);
insert into InternalAuth (id, password, userEntityId) values (4, md5(md5('qwe')), 4);
insert into UserSchoolDataIdentifier (identifier, dataSource_id, userEntity_id) values ('4', (select id from SchoolDataSource where identifier = 'LOCAL'), 4);

insert into UserEntity (id, archived) values (5, false);
insert into EnvironmentUser (id, archived, role_id, user_id) values (5, false, 8, 3);
insert into LocalUser (id, firstName, lastName, roleId, archived) values (5, 'Olli', 'Ohjaaja', 8, false);
insert into LocalUserEmail (user_id, address, archived) values (5, 'ohjaaja@oo.fi', false);
insert into InternalAuth (id, password, userEntityId) values (5, md5(md5('qwe')), 5);
insert into UserSchoolDataIdentifier (identifier, dataSource_id, userEntity_id) values ('5', (select id from SchoolDataSource where identifier = 'LOCAL'), 5);

