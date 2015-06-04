--INSERT INTO UserGroup VALUES (1,'Opiskelijat'),(2,'Opettajat'),(3,'Pikkupoppoo');

insert into PluginSettingKey(name, plugin) select 'roles.workspace.TEACHER', 'school-data-pyramus' from PluginSettingKey where plugin = 'school-data-pyramus' and name = 'roles.workspace.TEACHER' having count(*) = 0;
insert into PluginSetting (value, key_id) select '1', (select id from PluginSettingKey where plugin = 'school-data-pyramus' and name = 'roles.workspace.TEACHER') from PluginSetting having count(*) = 0;

INSERT INTO WorkspaceTypeEntity (id, name) values (1, 'Course');
INSERT INTO WorkspaceTypeEntity (id, name) values (2, 'Group work');
INSERT INTO WorkspaceTypeEntity (id, name) values (3, 'Game');
INSERT INTO WorkspaceTypeEntity (id, name) values (4, 'Pool');

insert into WorkspaceSettingsTemplate (defaultWorkspaceUserRole_id) values ((select id from RoleEntity where name = 'Workspace Student'));
insert into WorkspaceSettings (workspaceEntity_id, defaultWorkspaceUserRole_id) (select id, (select id from RoleEntity where name = 'Workspace Student') from WorkspaceEntity);

insert into EnvironmentDefaults (id, httpPort, httpsPort) values (1, 8080, 8443);
update PluginSetting set value = 'http://0.0.0.0:8089/1' where key_id = (select id from PluginSettingKey where plugin = 'school-data-pyramus' and name = 'rest.url');
update PluginSetting set value = 'http://0.0.0.0:8089/oauth2ClientTest/success' where key_id = (select id from PluginSettingKey where plugin = 'school-data-pyramus' and name = 'rest.redirectUrl');

insert into AuthSource (name, strategy) values ('Pyramus', 'pyramusoauth');
insert into PluginSettingKey(name, plugin) select 'oauth.clientId', 'pyramus-oauth' from PluginSettingKey where plugin = 'pyramus-oauth' and name = 'oauth.clientId' having count(*) = 0;
insert into PluginSettingKey(name, plugin) select 'oauth.clientSecret', 'pyramus-oauth' from PluginSettingKey where plugin = 'pyramus-oauth' and name = 'oauth.clientSecret' having count(*) = 0;
insert into PluginSettingKey(name, plugin) select 'oauth.redirectUrl', 'pyramus-oauth' from PluginSettingKey where plugin = 'pyramus-oauth' and name = 'oauth.redirectUrl' having count(*) = 0;
insert into PluginSettingKey(name, plugin) select 'oauth.logoutUrl', 'pyramus-oauth' from PluginSettingKey where plugin = 'pyramus-oauth' and name = 'oauth.logoutUrl' having count(*) = 0;
insert into PluginSettingKey(name, plugin) select 'oauth.authUrl', 'pyramus-oauth' from PluginSettingKey where plugin = 'pyramus-oauth' and name = 'oauth.authUrl' having count(*) = 0;
insert into PluginSettingKey(name, plugin) select 'oauth.tokenUri', 'pyramus-oauth' from PluginSettingKey where plugin = 'pyramus-oauth' and name = 'oauth.tokenUri' having count(*) = 0;
insert into PluginSettingKey(name, plugin) select 'oauth.whoamiUrl', 'pyramus-oauth' from PluginSettingKey where plugin = 'pyramus-oauth' and name = 'oauth.whoamiUrl' having count(*) = 0;
insert into PluginSetting (value, key_id) select '88888888-4444-4444-4444-000000000000', (select id from PluginSettingKey where plugin = 'pyramus-oauth' and name = 'oauth.clientId') from PluginSetting where key_id = (select id from PluginSettingKey where plugin = 'pyramus-oauth' and name = 'oauth.clientId') having count(*) = 0;
insert into PluginSetting (value, key_id) select '22222222222222222222222222222222222222222222222222222', (select id from PluginSettingKey where plugin = 'pyramus-oauth' and name = 'oauth.clientSecret') from PluginSetting where key_id = (select id from PluginSettingKey where plugin = 'pyramus-oauth' and name = 'oauth.clientSecret') having count(*) = 0;
insert into PluginSetting (value, key_id) select 'http://0.0.0.0:8089/login?_stg=rsp', (select id from PluginSettingKey where plugin = 'pyramus-oauth' and name = 'oauth.redirectUrl') from PluginSetting where key_id = (select id from PluginSettingKey where plugin = 'pyramus-oauth' and name = 'oauth.redirectUrl') having count(*) = 0;
insert into PluginSetting (value, key_id) select 'http://0.0.0.0:8089/users/logout.page?redirectUrl=https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://0.0.0.0:8089', (select id from PluginSettingKey where plugin = 'pyramus-oauth' and name = 'oauth.logoutUrl') from PluginSetting where key_id = (select id from PluginSettingKey where plugin = 'pyramus-oauth' and name = 'oauth.logoutUrl') having count(*) = 0;
insert into PluginSetting (value, key_id) select 'http://0.0.0.0:8089/users/authorize.page?client_id=%s&response_type=code&redirect_uri=%s', (select id from PluginSettingKey where plugin = 'pyramus-oauth' and name = 'oauth.authUrl') from PluginSetting where key_id = (select id from PluginSettingKey where plugin = 'pyramus-oauth' and name = 'oauth.authUrl') having count(*) = 0;
insert into PluginSetting (value, key_id) select 'http://0.0.0.0:8089/1/oauth/token', (select id from PluginSettingKey where plugin = 'pyramus-oauth' and name = 'oauth.tokenUri') from PluginSetting where key_id = (select id from PluginSettingKey where plugin = 'pyramus-oauth' and name = 'oauth.tokenUri') having count(*) = 0;
insert into PluginSetting (value, key_id) select 'http://0.0.0.0:8089/1/system/whoami', (select id from PluginSettingKey where plugin = 'pyramus-oauth' and name = 'oauth.whoamiUrl') from PluginSetting where key_id = (select id from PluginSettingKey where plugin = 'pyramus-oauth' and name = 'oauth.whoamiUrl') having count(*) = 0;

insert into PluginSettingKey(name, plugin) select 'webhook.secret', 'school-data-pyramus' from PluginSettingKey where plugin = 'school-data-pyramus' and name = 'webhook.secret' having count(*) = 0;
insert into PluginSetting (value, key_id) select '88888888-4444-4444-4444-000000000000', (select id from PluginSettingKey where plugin = 'school-data-pyramus' and name = 'webhook.secret') from PluginSetting where key_id = (select id from PluginSettingKey where plugin = 'school-data-pyramus' and name = 'webhook.secret') having count(*) = 0;

insert into PluginSettingKey(name, plugin) select 'system.authCode', 'school-data-pyramus' from PluginSettingKey where plugin = 'school-data-pyramus' and name = 'system.authCode' having count(*) = 0;
insert into PluginSettingKey(name, plugin) select 'rest.url', 'school-data-pyramus' from PluginSettingKey where plugin = 'school-data-pyramus' and name = 'rest.url' having count(*) = 0;
insert into PluginSettingKey(name, plugin) select 'rest.clientId', 'school-data-pyramus' from PluginSettingKey where plugin = 'school-data-pyramus' and name = 'rest.clientId' having count(*) = 0;
insert into PluginSettingKey(name, plugin) select 'rest.clientSecret', 'school-data-pyramus' from PluginSettingKey where plugin = 'school-data-pyramus' and name = 'rest.clientSecret' having count(*) = 0;
insert into PluginSettingKey(name, plugin) select 'rest.redirectUrl', 'school-data-pyramus' from PluginSettingKey where plugin = 'school-data-pyramus' and name = 'rest.redirectUrl' having count(*) = 0;
insert into PluginSetting (value, key_id) select '111111111111111111111111111111111111', (select id from PluginSettingKey where plugin = 'school-data-pyramus' and name = 'system.authCode') from PluginSetting where key_id = (select id from PluginSettingKey where plugin = 'school-data-pyramus' and name = 'system.authCode') having count(*) = 0;
insert into PluginSetting (value, key_id) select 'http://0.0.0.0:8089/1', (select id from PluginSettingKey where plugin = 'school-data-pyramus' and name = 'rest.url') from PluginSetting where key_id = (select id from PluginSettingKey where plugin = 'school-data-pyramus' and name = 'rest.url') having count(*) = 0;
insert into PluginSetting (value, key_id) select '88888888-4444-4444-4444-000000000000', (select id from PluginSettingKey where plugin = 'school-data-pyramus' and name = 'rest.clientId') from PluginSetting where key_id = (select id from PluginSettingKey where plugin = 'school-data-pyramus' and name = 'rest.clientId') having count(*) = 0;
insert into PluginSetting (value, key_id) select '22222222222222222222222222222222222222222222222222222', (select id from PluginSettingKey where plugin = 'school-data-pyramus' and name = 'rest.clientSecret') from PluginSetting where key_id = (select id from PluginSettingKey where plugin = 'school-data-pyramus' and name = 'rest.clientSecret') having count(*) = 0;
insert into PluginSetting (value, key_id) select 'http://0.0.0.0:8089/oauth2ClientTest/success', (select id from PluginSettingKey where plugin = 'school-data-pyramus' and name = 'rest.redirectUrl') from PluginSetting where key_id = (select id from PluginSettingKey where plugin = 'school-data-pyramus' and name = 'rest.redirectUrl') having count(*) = 0;