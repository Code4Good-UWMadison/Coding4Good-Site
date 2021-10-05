create type status as enum ('Starting', 'In Progress', 'On Hold', 'Succeed', 'Failed', 'Maintaining');

alter type status owner to eaeeeivllbbgen;

create type user_role_type as enum ('Root', 'Developer', 'Admin', 'Event_Executive', 'Project_Manager', 'Project_Leader', 'Project_Member', 'Partner', 'Outreach', 'Treasury');

alter type user_role_type owner to eaeeeivllbbgen;

create table project
(
    id            serial not null
        constraint project_pkey
            primary key
        constraint project_id_key
            unique,
    title         varchar,
    description   varchar,
    contact       varchar,
    org_name      varchar,
    creation_time timestamp,
    status        status not null,
    project_link  varchar,
    video_link    varchar,
    applyable     boolean
);

alter table project
    owner to eaeeeivllbbgen;

create table users
(
    id             serial not null
        constraint users_pkey
            primary key,
    email          varchar(255)
        constraint users_email_key
            unique,
    name           text,
    password       varchar(255),
    create_date    timestamp,
    email_verified boolean default false
);

alter table users
    owner to eaeeeivllbbgen;

create table user_profile
(
    id                  serial  not null
        constraint user_profile_pkey
            primary key,
    uid                 integer not null
        constraint user_profile_uid_fkey
            references users
            on update cascade on delete cascade,
    nickname            varchar,
    year                integer,
    intended_teamleader boolean,
    pl                  varchar,
    dev                 varchar,
    resume              varchar,
    submission_time     timestamp,
    description         varchar
);

alter table user_profile
    owner to eaeeeivllbbgen;

create unique index user_profile_uid_uindex
    on user_profile (uid);

create table proposal
(
    id            serial not null
        constraint proposal_id_pk
            primary key,
    org_name      varchar,
    org_type      varchar,
    org_detail    varchar,
    name          varchar,
    position      varchar,
    contact       varchar,
    title         varchar,
    description   text,
    creation_time timestamp,
    email         varchar
);

alter table proposal
    owner to eaeeeivllbbgen;

create unique index proposal_id_uindex
    on proposal (id);

create table event
(
    title         varchar,
    event_time    timestamp,
    location      varchar,
    description   varchar,
    creation_time timestamp,
    id            integer default nextval('project_id_seq'::regclass) not null
        constraint event_id_pk
            primary key,
    image         varchar,
    link          varchar,
    type          varchar,
    status        integer default 0                                   not null
);

alter table event
    owner to eaeeeivllbbgen;

create table user_role
(
    user_id               integer        not null
        constraint user_role_users_id_fk
            references users
            on update cascade on delete cascade,
    user_role             user_role_type not null,
    associated_project_id integer
        constraint user_role_project_id_fk
            references project
            on update cascade on delete cascade,
    constraint user_role_pk
        unique (user_id, user_role, associated_project_id)
);

alter table user_role
    owner to eaeeeivllbbgen;

create table project_application_relation
(
    project_id integer not null
        constraint project_application_relation_project__fk
            references project
            on update cascade on delete cascade,
    user_id    integer not null
        constraint project_application_relation_users__fk
            references users
            on update cascade on delete cascade,
    constraint project_application_relation_pk
        primary key (project_id, user_id)
);

alter table project_application_relation
    owner to eaeeeivllbbgen;

