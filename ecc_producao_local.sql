--
-- PostgreSQL database dump
--

\restrict B1dcbFTGEdUmdSLUdmxOA6NVWGdjxnqQldcaj3KzRpN0kpaejmuTPCTRup84yG0

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA supabase_migrations;


ALTER SCHEMA supabase_migrations OWNER TO postgres;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone',
    'recovery_code'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE auth.oauth_authorization_status OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE auth.oauth_client_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


ALTER TYPE auth.oauth_response_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: app_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.app_role AS ENUM (
    'central_admin',
    'congregation_admin',
    'treasurer',
    'auditor',
    'viewer'
);


ALTER TYPE public.app_role OWNER TO postgres;

--
-- Name: cash_movement_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.cash_movement_type AS ENUM (
    'cash_in',
    'cash_expense',
    'withdrawal',
    'deposit',
    'physical_exit'
);


ALTER TYPE public.cash_movement_type OWNER TO postgres;

--
-- Name: cash_period_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.cash_period_status AS ENUM (
    'open',
    'closed'
);


ALTER TYPE public.cash_period_status OWNER TO postgres;

--
-- Name: closing_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.closing_status AS ENUM (
    'open',
    'submitted',
    'approved',
    'questioned',
    'closed'
);


ALTER TYPE public.closing_status OWNER TO postgres;

--
-- Name: congregation_level; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.congregation_level AS ENUM (
    'national_hq',
    'state_hq',
    'sub_hq',
    'local_congregation'
);


ALTER TYPE public.congregation_level OWNER TO postgres;

--
-- Name: correction_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.correction_status AS ENUM (
    'posted',
    'reversed'
);


ALTER TYPE public.correction_status OWNER TO postgres;

--
-- Name: document_entity; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.document_entity AS ENUM (
    'entry',
    'expense',
    'transfer',
    'correction'
);


ALTER TYPE public.document_entity OWNER TO postgres;

--
-- Name: expense_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.expense_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'reversed'
);


ALTER TYPE public.expense_status OWNER TO postgres;

--
-- Name: reopening_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.reopening_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.reopening_status OWNER TO postgres;

--
-- Name: transfer_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.transfer_status AS ENUM (
    'planned',
    'requested',
    'approved',
    'sent',
    'confirmed',
    'questioned',
    'cancelled'
);


ALTER TYPE public.transfer_status OWNER TO postgres;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_realtime_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in',
    'like',
    'ilike',
    'is',
    'match',
    'imatch',
    'isdistinct'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_realtime_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text,
	negate boolean
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_realtime_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_realtime_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_realtime_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
    revoke trigger on cron.job_run_details from postgres;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $_$
begin
    if not exists (
        select 1
        from pg_catalog.pg_event_trigger_ddl_commands() ev
        join pg_catalog.pg_extension e on ev.objid = e.oid
        where e.extname = 'pg_graphql'
    ) then
        return;
    end if;

    drop function if exists graphql_public.graphql;
    create or replace function graphql_public.graphql(
        "operationName" text default null,
        query text default null,
        variables jsonb default null,
        extensions jsonb default null
    )
        returns jsonb
        language sql
    as $$
        select graphql.resolve(
            query := query,
            variables := coalesce(variables, '{}'),
            "operationName" := "operationName",
            extensions := extensions
        );
    $$;

    -- Attach the wrapper to the extension so DROP EXTENSION cascades to it,
    -- which in turn triggers set_graphql_placeholder to reinstall the "not enabled" stub.
    alter extension pg_graphql add function graphql_public.graphql(text, text, jsonb, jsonb);

    grant usage on schema graphql to postgres, anon, authenticated, service_role;
    grant execute on function graphql.resolve to postgres, anon, authenticated, service_role;
    grant usage on schema graphql to postgres with grant option;
    grant usage on schema graphql_public to postgres with grant option;
end;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8.0', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
            set search_path to ''
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: graphql(text, text, jsonb, jsonb); Type: FUNCTION; Schema: graphql_public; Owner: supabase_admin
--

CREATE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;


ALTER FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) OWNER TO supabase_admin;

--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: congregations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.congregations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    city text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    state text,
    organization_type text DEFAULT 'church'::text NOT NULL,
    is_headquarters boolean DEFAULT false NOT NULL,
    parent_id uuid,
    leader_name text,
    organization_level public.congregation_level DEFAULT 'local_congregation'::public.congregation_level NOT NULL,
    CONSTRAINT congregations_headquarters_level_check CHECK ((is_headquarters = (organization_level <> 'local_congregation'::public.congregation_level))),
    CONSTRAINT congregations_organization_type_check CHECK ((organization_type = ANY (ARRAY['church'::text, 'ong'::text])))
);


ALTER TABLE public.congregations OWNER TO postgres;

--
-- Name: admin_create_congregation(uuid, text, text, text, text, boolean, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.admin_create_congregation(p_actor_id uuid, p_name text, p_city text, p_state text, p_organization_type text, p_is_headquarters boolean, p_parent_id uuid DEFAULT NULL::uuid) RETURNS public.congregations
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  created_organization public.congregations;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'admin_service_role_required'; end if;
  if p_actor_id is null then raise exception 'admin_actor_required'; end if;
  if p_name is null or btrim(p_name) = '' then raise exception 'organization_name_required'; end if;
  if p_city is null or btrim(p_city) = '' then raise exception 'organization_city_required'; end if;
  if p_state is null or btrim(p_state) = '' then raise exception 'organization_state_required'; end if;
  if p_organization_type not in ('church', 'ong') then raise exception 'organization_type_invalid'; end if;
  if coalesce(p_is_headquarters, false) and p_parent_id is not null then
    raise exception 'headquarters_cannot_have_parent';
  end if;
  if p_parent_id is not null and not exists (
    select 1 from public.congregations
    where id = p_parent_id
      and is_headquarters
      and organization_type = p_organization_type
  ) then
    raise exception 'parent_headquarters_invalid';
  end if;

  insert into public.congregations (name, city, state, organization_type, is_headquarters, parent_id)
  values (btrim(p_name), btrim(p_city), btrim(p_state), p_organization_type, coalesce(p_is_headquarters, false), p_parent_id)
  returning * into created_organization;

  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason)
  values (p_actor_id, created_organization.id, 'created', 'congregations', created_organization.id, to_jsonb(created_organization), 'platform_admin_organization_create');
  return created_organization;
end;
$$;


ALTER FUNCTION public.admin_create_congregation(p_actor_id uuid, p_name text, p_city text, p_state text, p_organization_type text, p_is_headquarters boolean, p_parent_id uuid) OWNER TO postgres;

--
-- Name: admin_create_congregation(uuid, text, text, text, text, boolean, uuid, public.congregation_level); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.admin_create_congregation(p_actor_id uuid, p_name text, p_city text, p_state text, p_organization_type text, p_is_headquarters boolean, p_parent_id uuid, p_organization_level public.congregation_level) RETURNS public.congregations
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  created_organization public.congregations;
  valid_parent boolean := false;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'admin_service_role_required'; end if;
  if p_actor_id is null then raise exception 'admin_actor_required'; end if;
  if p_name is null or btrim(p_name) = '' then raise exception 'organization_name_required'; end if;
  if p_city is null or btrim(p_city) = '' then raise exception 'organization_city_required'; end if;
  if p_state is null or btrim(p_state) = '' then raise exception 'organization_state_required'; end if;
  if p_organization_type not in ('church', 'ong') then raise exception 'organization_type_invalid'; end if;
  if p_organization_level is null then raise exception 'organization_level_required'; end if;
  if p_is_headquarters is distinct from (p_organization_level <> 'local_congregation') then
    raise exception 'headquarters_level_mismatch';
  end if;
  if p_organization_level = 'national_hq' and p_parent_id is not null then
    raise exception 'national_headquarters_must_be_root';
  end if;
  if p_parent_id is not null then
    select exists (
      select 1 from public.congregations parent
      where parent.id = p_parent_id
        and case p_organization_level
          when 'state_hq' then parent.organization_level = 'national_hq'
          when 'sub_hq' then parent.organization_level in ('national_hq', 'state_hq')
          when 'local_congregation' then parent.organization_level in ('national_hq', 'state_hq', 'sub_hq')
          else false
        end
    ) into valid_parent;
    if not valid_parent then raise exception 'parent_organization_level_invalid'; end if;
  elsif p_organization_level not in ('national_hq', 'local_congregation') then
    raise exception 'parent_organization_required';
  end if;

  insert into public.congregations (
    name, city, state, organization_type, is_headquarters, parent_id, organization_level
  ) values (
    btrim(p_name), btrim(p_city), btrim(p_state), p_organization_type,
    p_is_headquarters, p_parent_id, p_organization_level
  ) returning * into created_organization;

  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason)
  values (p_actor_id, created_organization.id, 'created', 'congregations', created_organization.id, to_jsonb(created_organization), 'platform_admin_organization_create');
  return created_organization;
end;
$$;


ALTER FUNCTION public.admin_create_congregation(p_actor_id uuid, p_name text, p_city text, p_state text, p_organization_type text, p_is_headquarters boolean, p_parent_id uuid, p_organization_level public.congregation_level) OWNER TO postgres;

--
-- Name: admin_replace_user_access(uuid, uuid, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.admin_replace_user_access(p_actor_id uuid, p_user_id uuid, p_assignments jsonb) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  assignment jsonb;
  target_congregation uuid;
  target_role public.app_role;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'admin_service_role_required'; end if;
  if p_actor_id is null or p_user_id is null or coalesce(jsonb_typeof(p_assignments), '') <> 'array' then
    raise exception 'admin_assignments_invalid';
  end if;

  delete from public.memberships where user_id = p_user_id;
  for assignment in select * from jsonb_array_elements(p_assignments) loop
    target_congregation := (assignment ->> 'congregationId')::uuid;
    target_role := (assignment ->> 'role')::public.app_role;
    if not coalesce((assignment -> 'permissions' ->> 'financial.read')::boolean, false)
      and (
        coalesce((assignment -> 'permissions' ->> 'financial.write')::boolean, false)
        or coalesce((assignment -> 'permissions' ->> 'financial.approve')::boolean, false)
        or coalesce((assignment -> 'permissions' ->> 'closing.submit')::boolean, false)
        or coalesce((assignment -> 'permissions' ->> 'audit.read')::boolean, false)
      ) then raise exception 'financial_read_required_for_other_permissions'; end if;
    if not exists (select 1 from public.congregations where id = target_congregation) then
      raise exception 'admin_congregation_not_found';
    end if;

    insert into public.memberships (user_id, congregation_id, role)
    values (p_user_id, target_congregation, target_role);
    insert into public.membership_permission_overrides (
      user_id, congregation_id, financial_read, financial_write,
      financial_approve, closing_submit, audit_read, hierarchy_view,
      hierarchy_financial_read, updated_at
    ) values (
      p_user_id, target_congregation,
      coalesce((assignment -> 'permissions' ->> 'financial.read')::boolean, false),
      coalesce((assignment -> 'permissions' ->> 'financial.write')::boolean, false),
      coalesce((assignment -> 'permissions' ->> 'financial.approve')::boolean, false),
      coalesce((assignment -> 'permissions' ->> 'closing.submit')::boolean, false),
      coalesce((assignment -> 'permissions' ->> 'audit.read')::boolean, false),
      coalesce((assignment -> 'permissions' ->> 'hierarchy.view')::boolean, false),
      coalesce((assignment -> 'permissions' ->> 'hierarchy.financial.read')::boolean, false),
      now()
    );
  end loop;

  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason)
  values (p_actor_id, null, 'updated', 'memberships', p_user_id,
          jsonb_build_object('assignments', p_assignments), 'platform_admin_access_update');
end;
$$;


ALTER FUNCTION public.admin_replace_user_access(p_actor_id uuid, p_user_id uuid, p_assignments jsonb) OWNER TO postgres;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    congregation_id uuid NOT NULL,
    occurred_on date NOT NULL,
    amount_cents bigint NOT NULL,
    category text NOT NULL,
    description text NOT NULL,
    vendor text,
    payment_method text NOT NULL,
    purpose text,
    cost_center text,
    receipt_id text,
    approved_by uuid,
    recorded_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    status public.expense_status DEFAULT 'pending'::public.expense_status NOT NULL,
    approved_at timestamp with time zone,
    is_internal_transfer boolean DEFAULT false NOT NULL,
    CONSTRAINT expenses_amount_cents_check CHECK ((amount_cents > 0))
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- Name: approve_expense(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.approve_expense(p_expense_id uuid) RETURNS public.expenses
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare target public.expenses; approved public.expenses;
begin
  select * into target from public.expenses where id = p_expense_id for update;
  if target.id is null then raise exception 'expense_not_found'; end if;
  if not public.has_congregation_permission(target.congregation_id, 'financial.approve') then raise exception 'financial_approval_not_allowed'; end if;
  if target.status <> 'pending' then raise exception 'expense_not_pending'; end if;
  update public.expenses set status = 'approved', approved_by = auth.uid(), approved_at = now() where id = p_expense_id returning * into approved;
  insert into public.audit_events(actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason)
  values (auth.uid(), target.congregation_id, 'approved', 'expenses', target.id, to_jsonb(target), to_jsonb(approved), 'expense_approval');
  return approved;
end;
$$;


ALTER FUNCTION public.approve_expense(p_expense_id uuid) OWNER TO postgres;

--
-- Name: period_reopening_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.period_reopening_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    congregation_id uuid NOT NULL,
    reference_period date NOT NULL,
    reason text NOT NULL,
    status public.reopening_status DEFAULT 'pending'::public.reopening_status NOT NULL,
    requested_by uuid NOT NULL,
    approved_by uuid,
    requested_at timestamp with time zone DEFAULT now() NOT NULL,
    approved_at timestamp with time zone,
    CONSTRAINT period_reopening_requests_reason_check CHECK ((btrim(reason) <> ''::text))
);


ALTER TABLE public.period_reopening_requests OWNER TO postgres;

--
-- Name: approve_period_reopening(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.approve_period_reopening(p_request_id uuid) RETURNS public.period_reopening_requests
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  actor uuid := public.require_authenticated();
  request_row public.period_reopening_requests;
  approved_row public.period_reopening_requests;
  before_closing public.monthly_closings;
  after_closing public.monthly_closings;
begin
  select * into request_row from public.period_reopening_requests where id = p_request_id for update;
  if request_row.id is null then raise exception 'reopening_request_not_found'; end if;
  if request_row.status <> 'pending' then raise exception 'reopening_request_not_pending'; end if;
  if request_row.requested_by = actor then raise exception 'reopening_self_approval_forbidden'; end if;
  if not public.has_congregation_role(request_row.congregation_id, array['central_admin']::public.app_role[]) then
    raise exception 'reopening_approval_not_allowed';
  end if;
  select * into before_closing from public.monthly_closings
  where congregation_id = request_row.congregation_id and reference_period = request_row.reference_period for update;
  if before_closing.status <> 'closed' then raise exception 'period_not_closed'; end if;
  update public.monthly_closings
  set status = 'open', closed_at = null, approved_by = actor
  where congregation_id = request_row.congregation_id and reference_period = request_row.reference_period
  returning * into after_closing;
  update public.period_reopening_requests
  set status = 'approved', approved_by = actor, approved_at = now()
  where id = p_request_id
  returning * into approved_row;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason)
  values (actor, request_row.congregation_id, 'approved', 'period_reopening_requests', p_request_id,
    jsonb_build_object('request', to_jsonb(request_row), 'closing', to_jsonb(before_closing)),
    jsonb_build_object('request', to_jsonb(approved_row), 'closing', to_jsonb(after_closing)), request_row.reason);
  return approved_row;
end;
$$;


ALTER FUNCTION public.approve_period_reopening(p_request_id uuid) OWNER TO postgres;

--
-- Name: headquarters_transfers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.headquarters_transfers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    origin_congregation_id uuid NOT NULL,
    destination_name text NOT NULL,
    reference_period date NOT NULL,
    amount_sent_cents bigint,
    amount_received_cents bigint,
    occurred_on date,
    status public.transfer_status DEFAULT 'planned'::public.transfer_status NOT NULL,
    reason text NOT NULL,
    requested_by uuid NOT NULL,
    approved_by uuid,
    receipt_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT headquarters_transfers_amount_received_cents_check CHECK ((amount_received_cents >= 0)),
    CONSTRAINT headquarters_transfers_amount_sent_cents_check CHECK ((amount_sent_cents > 0))
);


ALTER TABLE public.headquarters_transfers OWNER TO postgres;

--
-- Name: approve_transfer(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.approve_transfer(p_transfer_id uuid) RETURNS public.headquarters_transfers
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare target public.headquarters_transfers; approved public.headquarters_transfers;
begin
  select * into target from public.headquarters_transfers where id = p_transfer_id for update;
  if target.id is null then raise exception 'transfer_not_found'; end if;
  if not public.has_congregation_permission(target.origin_congregation_id, 'financial.approve') then raise exception 'transfer_approval_not_allowed'; end if;
  if target.status <> 'requested' then raise exception 'transfer_not_requested'; end if;
  update public.headquarters_transfers set status = 'approved', approved_by = auth.uid() where id = p_transfer_id returning * into approved;
  insert into public.audit_events(actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason)
  values (auth.uid(), target.origin_congregation_id, 'approved', 'headquarters_transfers', target.id, to_jsonb(target), to_jsonb(approved), 'transfer_approval');
  return approved;
end;
$$;


ALTER FUNCTION public.approve_transfer(p_transfer_id uuid) OWNER TO postgres;

--
-- Name: assert_equal(anyelement, anyelement, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.assert_equal(p_actual anyelement, p_expected anyelement, p_message text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF p_actual IS DISTINCT FROM p_expected THEN
    RAISE EXCEPTION 'ASSERTION_FAILED: % (actual=% expected=%)', p_message, p_actual, p_expected;
  END IF;
END;
$$;


ALTER FUNCTION public.assert_equal(p_actual anyelement, p_expected anyelement, p_message text) OWNER TO postgres;

--
-- Name: assert_not_null(anyelement, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.assert_not_null(p_value anyelement, p_message text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF p_value IS NULL THEN
    RAISE EXCEPTION 'ASSERTION_FAILED: %', p_message;
  END IF;
END;
$$;


ALTER FUNCTION public.assert_not_null(p_value anyelement, p_message text) OWNER TO postgres;

--
-- Name: assert_true(boolean, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.assert_true(p_condition boolean, p_message text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NOT p_condition THEN
    RAISE EXCEPTION 'ASSERTION_FAILED: %', p_message;
  END IF;
END;
$$;


ALTER FUNCTION public.assert_true(p_condition boolean, p_message text) OWNER TO postgres;

--
-- Name: audit_financial_insert(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.audit_financial_insert() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  target_actor uuid;
  target_congregation uuid;
  target_entity text;
begin
  if tg_table_name = 'headquarters_transfers' then
    target_actor := new.requested_by;
    target_congregation := new.origin_congregation_id;
  else
    target_actor := new.recorded_by;
    target_congregation := new.congregation_id;
  end if;
  target_entity := tg_table_name;
  insert into public.audit_events(actor_id, congregation_id, action, entity, entity_id, after_data, reason)
  values (target_actor, target_congregation, 'created', target_entity, new.id, to_jsonb(new), 'financial_record_created');
  return new;
end;
$$;


ALTER FUNCTION public.audit_financial_insert() OWNER TO postgres;

--
-- Name: physical_cash_periods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.physical_cash_periods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cash_register_id uuid NOT NULL,
    reference_period date NOT NULL,
    opening_balance_cents bigint NOT NULL,
    status public.cash_period_status DEFAULT 'open'::public.cash_period_status NOT NULL,
    counted_balance_cents bigint,
    counted_by uuid,
    counted_at timestamp with time zone,
    divergence_reason text,
    closed_by uuid,
    closed_at timestamp with time zone,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT physical_cash_periods_check CHECK ((((counted_balance_cents IS NULL) AND (counted_by IS NULL) AND (counted_at IS NULL)) OR ((counted_balance_cents IS NOT NULL) AND (counted_by IS NOT NULL) AND (counted_at IS NOT NULL)))),
    CONSTRAINT physical_cash_periods_counted_balance_cents_check CHECK (((counted_balance_cents IS NULL) OR (counted_balance_cents >= 0))),
    CONSTRAINT physical_cash_periods_opening_balance_cents_check CHECK ((opening_balance_cents >= 0))
);


ALTER TABLE public.physical_cash_periods OWNER TO postgres;

--
-- Name: close_cash_period(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.close_cash_period(p_cash_period_id uuid) RETURNS public.physical_cash_periods
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare actor uuid := public.require_authenticated(); period_row public.physical_cash_periods; register_row public.physical_cash_registers; closed_period public.physical_cash_periods;
begin
  select * into period_row from public.physical_cash_periods p where p.id = p_cash_period_id for update;
  select * into register_row from public.physical_cash_registers r where r.id = period_row.cash_register_id;
  if period_row.id is null then raise exception 'cash_period_not_found'; end if;
  if not public.has_congregation_permission(register_row.congregation_id, 'closing.submit') then raise exception 'cash_close_not_allowed'; end if;
  if period_row.status <> 'open' then raise exception 'cash_period_not_open'; end if;
  if period_row.counted_balance_cents is null then raise exception 'cash_count_required'; end if;
  update public.physical_cash_periods set status = 'closed', closed_by = actor, closed_at = now() where id = p_cash_period_id returning * into closed_period;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason)
  values (actor, register_row.congregation_id, 'closed', 'physical_cash_periods', period_row.id, to_jsonb(period_row), to_jsonb(closed_period), 'cash_period_closed');
  return closed_period;
end;
$$;


ALTER FUNCTION public.close_cash_period(p_cash_period_id uuid) OWNER TO postgres;

--
-- Name: monthly_closings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monthly_closings (
    congregation_id uuid NOT NULL,
    reference_period date NOT NULL,
    opening_balance_cents bigint DEFAULT 0 NOT NULL,
    adjustments_cents bigint DEFAULT 0 NOT NULL,
    status public.closing_status DEFAULT 'open'::public.closing_status NOT NULL,
    submitted_by uuid,
    approved_by uuid,
    closed_at timestamp with time zone,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.monthly_closings OWNER TO postgres;

--
-- Name: close_monthly_period(uuid, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.close_monthly_period(p_congregation_id uuid, p_reference_period date) RETURNS public.monthly_closings
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare closing public.monthly_closings;
begin
  if not public.has_congregation_permission(p_congregation_id, 'closing.submit') then raise exception 'closing_not_allowed'; end if;
  insert into public.monthly_closings (congregation_id, reference_period, status, submitted_by, approved_by, closed_at)
  values (p_congregation_id, date_trunc('month', p_reference_period)::date, 'closed', auth.uid(), auth.uid(), now())
  on conflict (congregation_id, reference_period) do update set status = 'closed', approved_by = auth.uid(), closed_at = now()
  returning * into closing;
  insert into public.audit_events(actor_id, congregation_id, action, entity, entity_id, after_data, reason)
  values (auth.uid(), p_congregation_id, 'closed', 'monthly_closings', closing.id, to_jsonb(closing), 'monthly_period_closed');
  return closing;
end;
$$;


ALTER FUNCTION public.close_monthly_period(p_congregation_id uuid, p_reference_period date) OWNER TO postgres;

--
-- Name: confirm_transfer(uuid, bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.confirm_transfer(p_transfer_id uuid, p_amount_received_cents bigint) RETURNS public.headquarters_transfers
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare target public.headquarters_transfers; confirmed public.headquarters_transfers; next_status public.transfer_status;
begin
  select * into target from public.headquarters_transfers where id = p_transfer_id for update;
  if target.id is null then raise exception 'transfer_not_found'; end if;
  if not public.has_congregation_role(target.origin_congregation_id, array['central_admin']::public.app_role[]) then
    raise exception 'headquarters_confirmation_not_allowed';
  end if;
  if target.status not in ('approved', 'sent') then raise exception 'transfer_not_ready_for_confirmation'; end if;
  next_status := case when target.amount_sent_cents = p_amount_received_cents then 'confirmed' else 'questioned' end;
  update public.headquarters_transfers set amount_received_cents = p_amount_received_cents, status = next_status where id = p_transfer_id returning * into confirmed;
  insert into public.audit_events(actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason)
  values (auth.uid(), target.origin_congregation_id, 'confirmed', 'headquarters_transfers', target.id, to_jsonb(target), to_jsonb(confirmed), case when next_status = 'confirmed' then 'transfer_reconciled' else 'transfer_divergence' end);
  return confirmed;
end;
$$;


ALTER FUNCTION public.confirm_transfer(p_transfer_id uuid, p_amount_received_cents bigint) OWNER TO postgres;

--
-- Name: count_cash(uuid, bigint, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.count_cash(p_cash_period_id uuid, p_counted_balance_cents bigint, p_divergence_reason text DEFAULT NULL::text) RETURNS public.physical_cash_periods
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare actor uuid := public.require_authenticated(); period_row public.physical_cash_periods; register_row public.physical_cash_registers; updated_period public.physical_cash_periods; expected_balance bigint;
begin
  select * into period_row from public.physical_cash_periods p where p.id = p_cash_period_id for update;
  select * into register_row from public.physical_cash_registers r where r.id = period_row.cash_register_id;
  if period_row.id is null then raise exception 'cash_period_not_found'; end if;
  if period_row.status <> 'open' then raise exception 'cash_period_not_open'; end if;
  if not public.has_congregation_role(register_row.congregation_id, array['treasurer', 'congregation_admin', 'central_admin']::public.app_role[]) then raise exception 'cash_count_not_allowed'; end if;
  if p_counted_balance_cents is null or p_counted_balance_cents < 0 then raise exception 'cash_count_invalid'; end if;
  select period_row.opening_balance_cents + coalesce(sum(case when movement_type = 'cash_in' then amount_cents else -amount_cents end), 0)
  into expected_balance from public.physical_cash_movements where cash_period_id = p_cash_period_id;
  if p_counted_balance_cents <> expected_balance and (p_divergence_reason is null or btrim(p_divergence_reason) = '') then raise exception 'cash_divergence_reason_required'; end if;
  update public.physical_cash_periods set counted_balance_cents = p_counted_balance_cents, counted_by = actor, counted_at = now(), divergence_reason = p_divergence_reason where id = p_cash_period_id returning * into updated_period;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason) values (actor, register_row.congregation_id, 'counted', 'physical_cash_periods', period_row.id, to_jsonb(period_row), to_jsonb(updated_period), coalesce(p_divergence_reason, 'cash_counted'));
  return updated_period;
end;
$$;


ALTER FUNCTION public.count_cash(p_cash_period_id uuid, p_counted_balance_cents bigint, p_divergence_reason text) OWNER TO postgres;

--
-- Name: physical_cash_registers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.physical_cash_registers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    congregation_id uuid NOT NULL,
    name text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT physical_cash_registers_name_check CHECK ((btrim(name) <> ''::text))
);


ALTER TABLE public.physical_cash_registers OWNER TO postgres;

--
-- Name: create_cash_register(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_cash_register(p_congregation_id uuid, p_name text) RETURNS public.physical_cash_registers
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare actor uuid := public.require_authenticated(); register_row public.physical_cash_registers;
begin
  if not public.has_congregation_role(p_congregation_id, array['treasurer', 'congregation_admin', 'central_admin']::public.app_role[]) then raise exception 'cash_register_not_allowed'; end if;
  if p_name is null or btrim(p_name) = '' then raise exception 'cash_register_name_required'; end if;
  insert into public.physical_cash_registers (congregation_id, name, created_by) values (p_congregation_id, p_name, actor) returning * into register_row;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason) values (actor, p_congregation_id, 'created', 'physical_cash_registers', register_row.id, to_jsonb(register_row), 'cash_register_created');
  return register_row;
end;
$$;


ALTER FUNCTION public.create_cash_register(p_congregation_id uuid, p_name text) OWNER TO postgres;

--
-- Name: entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    congregation_id uuid NOT NULL,
    occurred_on date NOT NULL,
    amount_cents bigint NOT NULL,
    category text NOT NULL,
    origin text NOT NULL,
    payment_method text NOT NULL,
    purpose text,
    receipt_id text,
    recorded_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_internal_transfer boolean DEFAULT false NOT NULL,
    CONSTRAINT entries_amount_cents_check CHECK ((amount_cents > 0))
);


ALTER TABLE public.entries OWNER TO postgres;

--
-- Name: create_entry(uuid, date, bigint, text, text, text, text, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_entry(p_congregation_id uuid, p_occurred_on date, p_amount_cents bigint, p_category text, p_origin text, p_payment_method text, p_purpose text DEFAULT NULL::text, p_is_internal_transfer boolean DEFAULT false) RETURNS public.entries
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  created_entry public.entries;
begin
  if not public.has_congregation_role(p_congregation_id, array['central_admin', 'congregation_admin', 'treasurer']::public.app_role[]) then
    raise exception 'financial_write_not_allowed';
  end if;
  perform public.require_open_period(p_congregation_id, p_occurred_on);
  insert into public.entries (
    congregation_id, occurred_on, amount_cents, category, origin, payment_method,
    purpose, recorded_by, is_internal_transfer
  ) values (
    p_congregation_id, p_occurred_on, p_amount_cents, p_category, p_origin,
    p_payment_method, p_purpose, auth.uid(), coalesce(p_is_internal_transfer, false)
  ) returning * into created_entry;
  return created_entry;
end;
$$;


ALTER FUNCTION public.create_entry(p_congregation_id uuid, p_occurred_on date, p_amount_cents bigint, p_category text, p_origin text, p_payment_method text, p_purpose text, p_is_internal_transfer boolean) OWNER TO postgres;

--
-- Name: create_expense(uuid, date, bigint, text, text, text, text, text, text, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_expense(p_congregation_id uuid, p_occurred_on date, p_amount_cents bigint, p_category text, p_description text, p_vendor text DEFAULT NULL::text, p_payment_method text DEFAULT 'other'::text, p_purpose text DEFAULT NULL::text, p_cost_center text DEFAULT NULL::text, p_is_internal_transfer boolean DEFAULT false) RETURNS public.expenses
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  created_expense public.expenses;
begin
  if not public.has_congregation_role(p_congregation_id, array['central_admin', 'congregation_admin', 'treasurer']::public.app_role[]) then
    raise exception 'financial_write_not_allowed';
  end if;
  perform public.require_open_period(p_congregation_id, p_occurred_on);
  insert into public.expenses (
    congregation_id, occurred_on, amount_cents, category, description, vendor,
    payment_method, purpose, cost_center, recorded_by, is_internal_transfer
  ) values (
    p_congregation_id, p_occurred_on, p_amount_cents, p_category, p_description,
    p_vendor, p_payment_method, p_purpose, p_cost_center, auth.uid(),
    coalesce(p_is_internal_transfer, false)
  ) returning * into created_expense;
  return created_expense;
end;
$$;


ALTER FUNCTION public.create_expense(p_congregation_id uuid, p_occurred_on date, p_amount_cents bigint, p_category text, p_description text, p_vendor text, p_payment_method text, p_purpose text, p_cost_center text, p_is_internal_transfer boolean) OWNER TO postgres;

--
-- Name: financial_adjustments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.financial_adjustments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    congregation_id uuid NOT NULL,
    reference_period date NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    amount_cents bigint NOT NULL,
    reason text NOT NULL,
    status public.correction_status DEFAULT 'posted'::public.correction_status NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    idempotency_key uuid NOT NULL,
    CONSTRAINT financial_adjustments_amount_cents_check CHECK ((amount_cents <> 0)),
    CONSTRAINT financial_adjustments_entity_type_check CHECK ((entity_type = ANY (ARRAY['entries'::text, 'expenses'::text]))),
    CONSTRAINT financial_adjustments_reason_check CHECK ((btrim(reason) <> ''::text))
);


ALTER TABLE public.financial_adjustments OWNER TO postgres;

--
-- Name: create_financial_adjustment(uuid, text, uuid, bigint, text, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_financial_adjustment(p_congregation_id uuid, p_entity_type text, p_entity_id uuid, p_amount_cents bigint, p_reason text, p_idempotency_key uuid) RETURNS public.financial_adjustments
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare actor uuid := public.require_authenticated(); source_congregation uuid; source_period date; adjustment public.financial_adjustments;
begin
  if not public.has_congregation_permission(p_congregation_id, 'financial.approve') then raise exception 'adjustment_not_allowed'; end if;
  if p_amount_cents is null or p_amount_cents = 0 then raise exception 'adjustment_amount_invalid'; end if;
  if p_reason is null or btrim(p_reason) = '' then raise exception 'adjustment_reason_required'; end if;
  if p_idempotency_key is null then raise exception 'adjustment_idempotency_key_required'; end if;
  if p_entity_type = 'entries' then
    select congregation_id, occurred_on into source_congregation, source_period from public.entries where id = p_entity_id;
  elsif p_entity_type = 'expenses' then
    select congregation_id, occurred_on into source_congregation, source_period from public.expenses where id = p_entity_id;
  else raise exception 'adjustment_entity_type_invalid'; end if;
  if source_congregation is null then raise exception 'adjustment_entity_not_found'; end if;
  if source_congregation <> p_congregation_id then raise exception 'adjustment_cross_congregation_forbidden'; end if;
  if public.period_is_closed(source_congregation, source_period) then raise exception 'closed_period_requires_reopening'; end if;
  insert into public.financial_adjustments (congregation_id, reference_period, entity_type, entity_id, amount_cents, reason, created_by, idempotency_key)
  values (p_congregation_id, date_trunc('month', source_period)::date, p_entity_type, p_entity_id, p_amount_cents, p_reason, actor, p_idempotency_key)
  on conflict (created_by, idempotency_key) do nothing returning * into adjustment;
  if adjustment.id is null then
    select * into adjustment from public.financial_adjustments where created_by = actor and idempotency_key = p_idempotency_key;
    return adjustment;
  end if;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason)
  values (actor, p_congregation_id, 'posted', 'financial_adjustments', adjustment.id, to_jsonb(adjustment), p_reason);
  return adjustment;
end;
$$;


ALTER FUNCTION public.create_financial_adjustment(p_congregation_id uuid, p_entity_type text, p_entity_id uuid, p_amount_cents bigint, p_reason text, p_idempotency_key uuid) OWNER TO postgres;

--
-- Name: financial_reversals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.financial_reversals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    congregation_id uuid NOT NULL,
    reference_period date NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    amount_cents bigint NOT NULL,
    reason text NOT NULL,
    status public.correction_status DEFAULT 'posted'::public.correction_status NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    idempotency_key uuid NOT NULL,
    CONSTRAINT financial_reversals_amount_cents_check CHECK ((amount_cents > 0)),
    CONSTRAINT financial_reversals_entity_type_check CHECK ((entity_type = ANY (ARRAY['entries'::text, 'expenses'::text]))),
    CONSTRAINT financial_reversals_reason_check CHECK ((btrim(reason) <> ''::text))
);


ALTER TABLE public.financial_reversals OWNER TO postgres;

--
-- Name: create_financial_reversal(uuid, text, uuid, text, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_financial_reversal(p_congregation_id uuid, p_entity_type text, p_entity_id uuid, p_reason text, p_idempotency_key uuid) RETURNS public.financial_reversals
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare actor uuid := public.require_authenticated(); source_congregation uuid; source_period date; source_amount bigint; reversal public.financial_reversals;
begin
  if not public.has_congregation_permission(p_congregation_id, 'financial.approve') then raise exception 'reversal_not_allowed'; end if;
  if p_reason is null or btrim(p_reason) = '' then raise exception 'reversal_reason_required'; end if;
  if p_idempotency_key is null then raise exception 'reversal_idempotency_key_required'; end if;
  if p_entity_type = 'entries' then
    select congregation_id, occurred_on, amount_cents into source_congregation, source_period, source_amount from public.entries where id = p_entity_id;
  elsif p_entity_type = 'expenses' then
    select congregation_id, occurred_on, amount_cents into source_congregation, source_period, source_amount from public.expenses where id = p_entity_id;
  else raise exception 'reversal_entity_type_invalid'; end if;
  if source_congregation is null then raise exception 'reversal_entity_not_found'; end if;
  if source_congregation <> p_congregation_id then raise exception 'reversal_cross_congregation_forbidden'; end if;
  if public.period_is_closed(source_congregation, source_period) then raise exception 'closed_period_requires_reopening'; end if;
  insert into public.financial_reversals (congregation_id, reference_period, entity_type, entity_id, amount_cents, reason, created_by, idempotency_key)
  values (p_congregation_id, date_trunc('month', source_period)::date, p_entity_type, p_entity_id, source_amount, p_reason, actor, p_idempotency_key)
  on conflict (entity_type, entity_id) do nothing returning * into reversal;
  if reversal.id is null then
    select * into reversal from public.financial_reversals where entity_type = p_entity_type and entity_id = p_entity_id;
    if reversal.created_by = actor and reversal.idempotency_key = p_idempotency_key then return reversal; end if;
    raise exception 'reversal_already_exists';
  end if;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason)
  values (actor, p_congregation_id, 'posted', 'financial_reversals', reversal.id, to_jsonb(reversal), p_reason);
  return reversal;
end;
$$;


ALTER FUNCTION public.create_financial_reversal(p_congregation_id uuid, p_entity_type text, p_entity_id uuid, p_reason text, p_idempotency_key uuid) OWNER TO postgres;

--
-- Name: get_hierarchical_financial_metrics(uuid, uuid, text, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_hierarchical_financial_metrics(p_user_id uuid, p_unit_id uuid, p_mode text, p_start_date date, p_end_date date) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  metrics jsonb;
  can_read_hierarchy boolean := false;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'financial_metrics_user_mismatch' using errcode = '42501';
  end if;
  if p_mode is null or p_mode not in ('local', 'consolidated') then
    raise exception 'financial_metrics_mode_invalid';
  end if;
  if p_unit_id is null or p_start_date is null or p_end_date is null or p_end_date < p_start_date then
    raise exception 'financial_metrics_period_invalid';
  end if;
  if not exists (select 1 from public.congregations where id = p_unit_id) then
    raise exception 'financial_metrics_unit_not_found';
  end if;

  if p_mode = 'local' then
    if not public.has_congregation_permission(p_unit_id, 'financial.read') then
      raise exception 'financial_read_not_allowed' using errcode = '42501';
    end if;
  else
    select coalesce(permission_override.hierarchy_financial_read, false)
      into can_read_hierarchy
    from public.membership_permission_overrides permission_override
    where permission_override.user_id = p_user_id
      and permission_override.congregation_id = p_unit_id;
    if not coalesce(can_read_hierarchy, false) then
      raise exception 'hierarchy_financial_read_not_allowed' using errcode = '42501';
    end if;
  end if;

  with recursive unit_tree(id, name, parent_id, organization_level, depth, visited) as (
    select congregation.id, congregation.name, null::uuid, congregation.organization_level, 0,
           array[congregation.id]::uuid[]
    from public.congregations congregation
    where congregation.id = p_unit_id
    union all
    select child.id, child.name, child.parent_id, child.organization_level, parent.depth + 1,
           parent.visited || child.id
    from public.congregations child
    join unit_tree parent on child.parent_id = parent.id
    where p_mode = 'consolidated'
      and not child.id = any(parent.visited)
  ),
  unit_totals as (
    select unit_tree.id as unit_id,
           unit_tree.name,
           unit_tree.parent_id,
           unit_tree.organization_level as level,
           unit_tree.depth,
           unit_tree.visited,
           coalesce(income.total, 0)::bigint as total_income,
           coalesce(expense.total, 0)::bigint as total_expense
    from unit_tree
    left join lateral (
      select sum(entry.amount_cents)::bigint as total
      from public.entries entry
      where entry.congregation_id = unit_tree.id
        and entry.occurred_on between p_start_date and p_end_date
        and (p_mode <> 'consolidated' or not entry.is_internal_transfer)
    ) income on true
    left join lateral (
      select sum(expense.amount_cents)::bigint as total
      from public.expenses expense
      where expense.congregation_id = unit_tree.id
        and expense.occurred_on between p_start_date and p_end_date
        and (p_mode <> 'consolidated' or not expense.is_internal_transfer)
    ) expense on true
  ),
  branch_totals as (
    select parent.unit_id,
           sum(descendant.total_income)::bigint as total_income,
           sum(descendant.total_expense)::bigint as total_expense
    from unit_totals parent
    join unit_totals descendant on parent.unit_id = any(descendant.visited)
    group by parent.unit_id
  )
  select jsonb_build_object(
    'total_income', coalesce(sum(unit_totals.total_income), 0),
    'total_expense', coalesce(sum(unit_totals.total_expense), 0),
    'balance', coalesce(sum(unit_totals.total_income - unit_totals.total_expense), 0),
    'units', coalesce(
      jsonb_agg(jsonb_build_object(
        'unit_id', unit_totals.unit_id,
        'name', unit_totals.name,
        'parent_id', unit_totals.parent_id,
        'level', unit_totals.level,
        'total_income', unit_totals.total_income,
        'total_expense', unit_totals.total_expense,
        'balance', unit_totals.total_income - unit_totals.total_expense,
        'subtree_total_income', branch_totals.total_income,
        'subtree_total_expense', branch_totals.total_expense,
        'subtree_balance', branch_totals.total_income - branch_totals.total_expense,
        'recent_movements', coalesce(movements.items, '[]'::jsonb)
      ) order by unit_totals.depth, unit_totals.name),
      '[]'::jsonb
    )
  ) into metrics
  from unit_totals
  join branch_totals on branch_totals.unit_id = unit_totals.unit_id
  left join lateral (
    select jsonb_agg(to_jsonb(recent) order by recent.occurred_on desc) as items
    from (
      select movement.id, movement.occurred_on::text as occurred_on, movement.kind,
             movement.label, movement.amount_cents
      from (
        select entry.id, entry.occurred_on, 'income'::text as kind,
               entry.category as label, entry.amount_cents
        from public.entries entry
        where entry.congregation_id = unit_totals.unit_id
          and entry.occurred_on between p_start_date and p_end_date
          and (p_mode <> 'consolidated' or not entry.is_internal_transfer)
        union all
        select expense.id, expense.occurred_on, 'expense'::text as kind,
               expense.description as label, expense.amount_cents
        from public.expenses expense
        where expense.congregation_id = unit_totals.unit_id
          and expense.occurred_on between p_start_date and p_end_date
          and (p_mode <> 'consolidated' or not expense.is_internal_transfer)
      ) movement
      order by movement.occurred_on desc, movement.id
      limit 10
    ) recent
  ) movements on true;

  return metrics;
end;
$$;


ALTER FUNCTION public.get_hierarchical_financial_metrics(p_user_id uuid, p_unit_id uuid, p_mode text, p_start_date date, p_end_date date) OWNER TO postgres;

--
-- Name: has_congregation_permission(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.has_congregation_permission(target_congregation uuid, target_permission text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  actor_role public.app_role;
  permission_override public.membership_permission_overrides;
begin
  select role into actor_role
  from public.memberships
  where user_id = auth.uid() and congregation_id = target_congregation;

  if actor_role is null then return false; end if;

  select * into permission_override
  from public.membership_permission_overrides
  where user_id = auth.uid() and congregation_id = target_congregation;

  if target_permission = 'hierarchy.financial.read' then
    return found and permission_override.hierarchy_financial_read;
  elsif target_permission = 'hierarchy.view' then
    return found and permission_override.hierarchy_view;
  end if;

  if found then
    if target_permission <> 'financial.read' and not permission_override.financial_read then return false; end if;
    return case target_permission
      when 'financial.read' then permission_override.financial_read
      when 'financial.write' then permission_override.financial_write
      when 'financial.approve' then permission_override.financial_approve
      when 'closing.submit' then permission_override.closing_submit
      when 'audit.read' then permission_override.audit_read
      else false
    end;
  end if;

  return case target_permission
    when 'financial.read' then true
    when 'financial.write' then actor_role in ('central_admin', 'congregation_admin', 'treasurer')
    when 'financial.approve' then actor_role in ('central_admin', 'congregation_admin')
    when 'closing.submit' then actor_role in ('central_admin', 'congregation_admin', 'treasurer')
    when 'audit.read' then actor_role in ('central_admin', 'congregation_admin', 'auditor')
    else false
  end;
end;
$$;


ALTER FUNCTION public.has_congregation_permission(target_congregation uuid, target_permission text) OWNER TO postgres;

--
-- Name: has_congregation_role(uuid, public.app_role[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.has_congregation_role(target_congregation uuid, allowed_roles public.app_role[]) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  actor_role public.app_role;
  has_override boolean;
begin
  select role into actor_role
  from public.memberships
  where user_id = auth.uid() and congregation_id = target_congregation;
  if actor_role is null then return false; end if;

  select exists (
    select 1 from public.membership_permission_overrides
    where user_id = auth.uid() and congregation_id = target_congregation
  ) into has_override;

  if has_override and 'treasurer' = any(allowed_roles) then
    return public.has_congregation_permission(target_congregation, 'financial.write');
  end if;

  return actor_role = any(allowed_roles);
end;
$$;


ALTER FUNCTION public.has_congregation_role(target_congregation uuid, allowed_roles public.app_role[]) OWNER TO postgres;

--
-- Name: is_congregation_member(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_congregation_member(target_congregation uuid) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select public.has_congregation_permission(target_congregation, 'financial.read');
$$;


ALTER FUNCTION public.is_congregation_member(target_congregation uuid) OWNER TO postgres;

--
-- Name: open_cash_period(uuid, date, bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.open_cash_period(p_cash_register_id uuid, p_reference_period date, p_opening_balance_cents bigint) RETURNS public.physical_cash_periods
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare actor uuid := public.require_authenticated(); register_row public.physical_cash_registers; period_row public.physical_cash_periods;
begin
  select * into register_row from public.physical_cash_registers where id = p_cash_register_id;
  if register_row.id is null then raise exception 'cash_register_not_found'; end if;
  if not public.has_congregation_role(register_row.congregation_id, array['treasurer', 'congregation_admin', 'central_admin']::public.app_role[]) then raise exception 'cash_period_not_allowed'; end if;
  if p_opening_balance_cents is null or p_opening_balance_cents < 0 then raise exception 'cash_opening_amount_invalid'; end if;
  if public.period_is_closed(register_row.congregation_id, p_reference_period) then raise exception 'closed_period_requires_reopening'; end if;
  insert into public.physical_cash_periods (cash_register_id, reference_period, opening_balance_cents, created_by)
  values (p_cash_register_id, date_trunc('month', p_reference_period)::date, p_opening_balance_cents, actor)
  returning * into period_row;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason) values (actor, register_row.congregation_id, 'opened', 'physical_cash_periods', period_row.id, to_jsonb(period_row), 'cash_period_opened');
  return period_row;
end;
$$;


ALTER FUNCTION public.open_cash_period(p_cash_register_id uuid, p_reference_period date, p_opening_balance_cents bigint) OWNER TO postgres;

--
-- Name: period_is_closed(uuid, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.period_is_closed(target_congregation uuid, target_period date) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1 from public.monthly_closings
    where congregation_id = target_congregation
      and reference_period = date_trunc('month', target_period)::date
      and status = 'closed'
  );
$$;


ALTER FUNCTION public.period_is_closed(target_congregation uuid, target_period date) OWNER TO postgres;

--
-- Name: prevent_closed_period_changes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.prevent_closed_period_changes() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  target_congregation uuid;
  target_period date;
begin
  if tg_table_name = 'headquarters_transfers' then
    target_congregation := coalesce(new.origin_congregation_id, old.origin_congregation_id);
    target_period := coalesce(new.occurred_on, new.reference_period, old.occurred_on, old.reference_period);
  else
    target_congregation := coalesce(new.congregation_id, old.congregation_id);
    target_period := coalesce(new.occurred_on, old.occurred_on);
  end if;
  if public.period_is_closed(target_congregation, target_period) then
    raise exception 'closed_period_requires_correction_or_reopening';
  end if;
  return coalesce(new, old);
end;
$$;


ALTER FUNCTION public.prevent_closed_period_changes() OWNER TO postgres;

--
-- Name: physical_cash_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.physical_cash_movements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cash_period_id uuid NOT NULL,
    movement_type public.cash_movement_type NOT NULL,
    amount_cents bigint NOT NULL,
    reason text NOT NULL,
    source_entity_type text,
    source_entity_id uuid,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    idempotency_key uuid NOT NULL,
    CONSTRAINT physical_cash_movements_amount_cents_check CHECK ((amount_cents > 0)),
    CONSTRAINT physical_cash_movements_reason_check CHECK ((btrim(reason) <> ''::text))
);


ALTER TABLE public.physical_cash_movements OWNER TO postgres;

--
-- Name: record_cash_movement(uuid, public.cash_movement_type, bigint, text, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.record_cash_movement(p_cash_period_id uuid, p_movement_type public.cash_movement_type, p_amount_cents bigint, p_reason text, p_idempotency_key uuid) RETURNS public.physical_cash_movements
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare actor uuid := public.require_authenticated(); period_row public.physical_cash_periods; register_row public.physical_cash_registers; movement public.physical_cash_movements; expected_balance bigint;
begin
  select * into period_row from public.physical_cash_periods p where p.id = p_cash_period_id for update;
  select * into register_row from public.physical_cash_registers r where r.id = period_row.cash_register_id;
  if period_row.id is null then raise exception 'cash_period_not_found'; end if;
  if period_row.status <> 'open' then raise exception 'cash_period_not_open'; end if;
  if not public.has_congregation_role(register_row.congregation_id, array['treasurer', 'congregation_admin', 'central_admin']::public.app_role[]) then raise exception 'cash_movement_not_allowed'; end if;
  if p_amount_cents is null or p_amount_cents <= 0 then raise exception 'cash_amount_invalid'; end if;
  if p_reason is null or btrim(p_reason) = '' then raise exception 'cash_reason_required'; end if;
  if p_idempotency_key is null then raise exception 'cash_idempotency_key_required'; end if;
  if public.period_is_closed(register_row.congregation_id, period_row.reference_period) then raise exception 'closed_period_requires_reopening'; end if;
  select * into movement
  from public.physical_cash_movements
  where created_by = actor and idempotency_key = p_idempotency_key;
  if movement.id is not null then return movement; end if;
  select period_row.opening_balance_cents + coalesce(sum(case when movement_type = 'cash_in' then amount_cents else -amount_cents end), 0)
  into expected_balance
  from public.physical_cash_movements
  where cash_period_id = p_cash_period_id;
  if p_movement_type <> 'cash_in' and expected_balance < p_amount_cents then
    raise exception 'cash_insufficient_balance';
  end if;
  insert into public.physical_cash_movements (cash_period_id, movement_type, amount_cents, reason, created_by, idempotency_key)
  values (p_cash_period_id, p_movement_type, p_amount_cents, p_reason, actor, p_idempotency_key)
  on conflict (created_by, idempotency_key) do nothing returning * into movement;
  if movement.id is null then select * into movement from public.physical_cash_movements where created_by = actor and idempotency_key = p_idempotency_key; return movement; end if;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason) values (actor, register_row.congregation_id, 'created', 'physical_cash_movements', movement.id, to_jsonb(movement), p_reason);
  return movement;
end;
$$;


ALTER FUNCTION public.record_cash_movement(p_cash_period_id uuid, p_movement_type public.cash_movement_type, p_amount_cents bigint, p_reason text, p_idempotency_key uuid) OWNER TO postgres;

--
-- Name: request_period_reopening(uuid, date, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.request_period_reopening(p_congregation_id uuid, p_reference_period date, p_reason text) RETURNS public.period_reopening_requests
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare actor uuid := public.require_authenticated(); request_row public.period_reopening_requests;
begin
  if not public.has_congregation_permission(p_congregation_id, 'closing.submit') then raise exception 'reopening_request_not_allowed'; end if;
  if p_reason is null or btrim(p_reason) = '' then raise exception 'reopening_reason_required'; end if;
  if not public.period_is_closed(p_congregation_id, p_reference_period) then raise exception 'period_not_closed'; end if;
  insert into public.period_reopening_requests (congregation_id, reference_period, reason, requested_by)
  values (p_congregation_id, date_trunc('month', p_reference_period)::date, p_reason, actor) returning * into request_row;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason)
  values (actor, p_congregation_id, 'requested', 'period_reopening_requests', request_row.id, to_jsonb(request_row), p_reason);
  return request_row;
end;
$$;


ALTER FUNCTION public.request_period_reopening(p_congregation_id uuid, p_reference_period date, p_reason text) OWNER TO postgres;

--
-- Name: request_transfer(uuid, text, date, bigint, text, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.request_transfer(p_origin_congregation_id uuid, p_destination_name text, p_reference_period date, p_amount_sent_cents bigint, p_reason text, p_occurred_on date DEFAULT NULL::date) RETURNS public.headquarters_transfers
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare created_transfer public.headquarters_transfers;
begin
  if not public.has_congregation_role(p_origin_congregation_id, array['central_admin', 'congregation_admin', 'treasurer']::public.app_role[]) then
    raise exception 'transfer_write_not_allowed';
  end if;
  perform public.require_open_period(p_origin_congregation_id, coalesce(p_occurred_on, p_reference_period));
  insert into public.headquarters_transfers (origin_congregation_id, destination_name, reference_period, amount_sent_cents, occurred_on, status, reason, requested_by)
  values (p_origin_congregation_id, p_destination_name, date_trunc('month', p_reference_period)::date, p_amount_sent_cents, p_occurred_on, 'requested', p_reason, auth.uid())
  returning * into created_transfer;
  return created_transfer;
end;
$$;


ALTER FUNCTION public.request_transfer(p_origin_congregation_id uuid, p_destination_name text, p_reference_period date, p_amount_sent_cents bigint, p_reason text, p_occurred_on date) OWNER TO postgres;

--
-- Name: require_authenticated(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.require_authenticated() RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;
  return auth.uid();
end;
$$;


ALTER FUNCTION public.require_authenticated() OWNER TO postgres;

--
-- Name: require_open_period(uuid, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.require_open_period(target_congregation uuid, target_period date) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if public.period_is_closed(target_congregation, target_period) then
    raise exception 'closed_period_requires_correction_or_reopening';
  end if;
end;
$$;


ALTER FUNCTION public.require_open_period(target_congregation uuid, target_period date) OWNER TO postgres;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
    -- Regclass of the table e.g. public.notes
    entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

    -- I, U, D, T: insert, update ...
    action realtime.action = (
        case wal ->> 'action'
            when 'I' then 'INSERT'
            when 'U' then 'UPDATE'
            when 'D' then 'DELETE'
            else 'ERROR'
        end
    );

    -- Is row level security enabled for the table
    is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

    subscriptions realtime.subscription[] = array_agg(subs)
        from
            realtime.subscription subs
        where
            subs.entity = entity_
            -- Filter by action early - only get subscriptions interested in this action
            -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
            and (subs.action_filter = '*' or subs.action_filter = action::text);

    -- Subscription vars
    working_role regrole;
    working_selected_columns text[];
    claimed_role regrole;
    claims jsonb;

    subscription_id uuid;
    subscription_has_access bool;
    visible_to_subscription_ids uuid[] = '{}';

    -- structured info for wal's columns
    columns realtime.wal_column[];
    -- previous identity values for update/delete
    old_columns realtime.wal_column[];

    error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

    -- Primary jsonb output for record
    output jsonb;

    -- Loop record for iterating unique roles (outer loop)
    role_record record;
    -- Loop record for iterating unique selected_columns within a role (inner loop)
    cols_record record;
    -- Subscription ids visible at the role level (before fanning out by selected_columns)
    visible_role_sub_ids uuid[] = '{}';

begin
    perform set_config('role', null, true);

    columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'columns') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    old_columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'identity') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    for role_record in
        select claims_role
        from (select distinct claims_role from unnest(subscriptions)) t
        order by claims_role::text
    loop
        working_role := role_record.claims_role;

        -- Update `is_selectable` for columns and old_columns (once per role)
        columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(columns) c;

        old_columns =
                array_agg(
                    (
                        c.name,
                        c.type_name,
                        c.type_oid,
                        c.value,
                        c.is_pkey,
                        pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                    )::realtime.wal_column
                )
                from
                    unnest(old_columns) c;

        if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
            -- Fan out 400 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 400: Bad Request, no primary key']
                )::realtime.wal_rls;
            end loop;

        -- The claims role does not have SELECT permission to the primary key of entity
        elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
            -- Fan out 401 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 401: Unauthorized']
                )::realtime.wal_rls;
            end loop;

        else
            -- Create the prepared statement (once per role)
            if is_rls_enabled and action <> 'DELETE' then
                if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                    deallocate walrus_rls_stmt;
                end if;
                execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
            end if;

            -- Collect all visible subscription IDs for this role (filter check + RLS check)
            visible_role_sub_ids = '{}';

            for subscription_id, claims in (
                    select
                        subs.subscription_id,
                        subs.claims
                    from
                        unnest(subscriptions) subs
                    where
                        subs.entity = entity_
                        and subs.claims_role = working_role
                        and (
                            realtime.is_visible_through_filters(columns, subs.filters)
                            or (
                              action = 'DELETE'
                              and realtime.is_visible_through_filters(old_columns, subs.filters)
                            )
                        )
            ) loop

                if not is_rls_enabled or action = 'DELETE' then
                    visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                else
                    -- Check if RLS allows the role to see the record
                    perform
                        -- Trim leading and trailing quotes from working_role because set_config
                        -- doesn't recognize the role as valid if they are included
                        set_config('role', trim(both '"' from working_role::text), true),
                        set_config('request.jwt.claims', claims::text, true);

                    execute 'execute walrus_rls_stmt' into subscription_has_access;

                    -- Reset the role on every FOR..LOOP batch execution.
                    -- The first batch of 10 rows is pre-fetched using the current connection role (PG internal behaviour)
                    -- then we have to reset it again otherwise it would use the role defined in the `set_config` above
                    -- to fetch the remaining rows when rows>10, which could be a user-defined role that lacks execution grants.
                    -- The flow is:
                    --   1. run batch with conn role
                    --   2. set_config working_role
                    --   3. execute walrus
                    --   4. reset role (revert)
                    --   5. repeat
                    perform set_config('role', null, true);

                    if subscription_has_access then
                        visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                    end if;
                end if;
            end loop;

            perform set_config('role', null, true);

            -- Inner loop: per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;

                output = jsonb_build_object(
                    'schema', wal ->> 'schema',
                    'table', wal ->> 'table',
                    'type', action,
                    'commit_timestamp', to_char(
                        ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
                    ),
                    'columns', (
                        select
                            jsonb_agg(
                                jsonb_build_object(
                                    'name', pa.attname,
                                    'type', pt.typname
                                )
                                order by pa.attnum asc
                            )
                        from
                            pg_attribute pa
                            join pg_type pt
                                on pa.atttypid = pt.oid
                            left join (
                                select unnest(conkey) as pkey_attnum
                                from pg_constraint
                                where conrelid = entity_ and contype = 'p'
                            ) pk on pk.pkey_attnum = pa.attnum
                        where
                            attrelid = entity_
                            and attnum > 0
                            and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
                            and (working_selected_columns is null or pa.attname = any(working_selected_columns) or pk.pkey_attnum is not null)
                    )
                )
                -- Add "record" key for insert and update
                || case
                    when action in ('INSERT', 'UPDATE') then
                        jsonb_build_object(
                            'record',
                            (
                                select
                                    jsonb_object_agg(
                                        -- if unchanged toast, get column name and value from old record
                                        coalesce((c).name, (oc).name),
                                        case
                                            when (c).name is null then (oc).value
                                            else (c).value
                                        end
                                    )
                                from
                                    unnest(columns) c
                                    full outer join unnest(old_columns) oc
                                        on (c).name = (oc).name
                                where
                                    coalesce((c).is_selectable, (oc).is_selectable)
                                    and (working_selected_columns is null or coalesce((c).name, (oc).name) = any(working_selected_columns) or coalesce((c).is_pkey, (oc).is_pkey))
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            )
                        )
                    else '{}'::jsonb
                end
                -- Add "old_record" key for update and delete
                || case
                    when action = 'UPDATE' then
                        jsonb_build_object(
                                'old_record',
                                (
                                    select jsonb_object_agg((c).name, (c).value)
                                    from unnest(old_columns) c
                                    where
                                        (c).is_selectable
                                        and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                        and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                )
                            )
                    when action = 'DELETE' then
                        jsonb_build_object(
                            'old_record',
                            (
                                select jsonb_object_agg((c).name, (c).value)
                                from unnest(old_columns) c
                                where
                                    (c).is_selectable
                                    and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                    and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                            )
                        )
                    else '{}'::jsonb
                end;

                -- Filter visible_role_sub_ids to those matching the current selected_columns group
                visible_to_subscription_ids = coalesce(
                    (
                        select array_agg(s.subscription_id)
                        from unnest(subscriptions) s
                        where s.claims_role = working_role
                          and (s.selected_columns is not distinct from working_selected_columns)
                          and s.subscription_id = any(visible_role_sub_ids)
                    ),
                    '{}'::uuid[]
                );

                return next (
                    output,
                    is_rls_enabled,
                    visible_to_subscription_ids,
                    case
                        when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                        else '{}'
                    end
                )::realtime.wal_rls;
            end loop;

        end if;
    end loop;

    perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_realtime_admin;

--
-- Name: authorize(text, text, text, text, text, text[], text[]); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.authorize(role_name text, topic_name text, claims text, sub text, headers text, read_extensions text[], write_extensions text[], OUT read_allowed boolean[], OUT write_allowed boolean[]) RETURNS record
    LANGUAGE plpgsql
    AS $$
declare
  probe_ids uuid[];
  probe_inserted_at timestamp := now() at time zone 'utc';
  visible_ids uuid[];
  ext text;
  allowed boolean;
begin
  -- The probe inserts are rolled back, but they still give the transaction an xid, so it ends
  -- in a commit. Nothing durable was written, so skip waiting on the WAL flush and sync standbys.
  -- Set outside the block below, whose rollback would undo it.
  perform set_config('synchronous_commit', 'off', true);

  -- The RAISE at the end of this block rolls back everything in it.
  begin
    probe_ids := array(select gen_random_uuid() from unnest(read_extensions));

    insert into realtime.messages (id, topic, extension, inserted_at, updated_at)
    select p.id, topic_name, p.extension, probe_inserted_at, probe_inserted_at
    from unnest(probe_ids, read_extensions) as p(id, extension);

    perform set_config('role', role_name, true),
            set_config('realtime.topic', topic_name, true),
            set_config('request.jwt.claims', claims, true),
            set_config('request.jwt.claim.sub', sub, true),
            set_config('request.jwt.claim.role', role_name, true),
            set_config('request.headers', headers, true);

    -- One lookup for every probe, by the full primary key.
    visible_ids := array(
      select m.id
      from realtime.messages m
      where m.inserted_at = probe_inserted_at
        and m.id = any(probe_ids));

    read_allowed := array(
      select p.id = any(visible_ids)
      from unnest(probe_ids) with ordinality as p(id, n)
      order by p.n);

    write_allowed := '{}';

    foreach ext in array write_extensions loop
      begin
        insert into realtime.messages (topic, extension, inserted_at, updated_at)
        values (topic_name, ext, now() at time zone 'utc', now() at time zone 'utc');

        allowed := true;
      exception when insufficient_privilege then
        allowed := false;
      end;

      write_allowed := write_allowed || allowed;
    end loop;

    raise sqlstate 'RTA01';
  exception when sqlstate 'RTA01' then
    null;
  end;
end;
$$;


ALTER FUNCTION realtime.authorize(role_name text, topic_name text, claims text, sub text, headers text, read_extensions text[], write_extensions text[], OUT read_allowed boolean[], OUT write_allowed boolean[]) OWNER TO supabase_realtime_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_realtime_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_realtime_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_realtime_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
/*
Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
*/
declare
    op_symbol text = (
        case
            when op = 'eq' then '='
            when op = 'neq' then '!='
            when op = 'lt' then '<'
            when op = 'lte' then '<='
            when op = 'gt' then '>'
            when op = 'gte' then '>='
            when op = 'in' then '= any'
            else 'UNKNOWN OP'
        end
    );
    res boolean;
begin
    execute format(
        'select %L::'|| type_::text || ' ' || op_symbol
        || ' ( %L::'
        || (
            case
                when op = 'in' then type_::text || '[]'
                else type_::text end
        )
        || ')', val_1, val_2) into res;
    return res;
end;
$$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_realtime_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
declare
    op_symbol text;
    res boolean;
begin
    -- IS DISTINCT FROM / IS NOT DISTINCT FROM: infix, both sides typed literals
    if op = 'isdistinct' then
        execute format(
            'select %L::%s %s %L::%s',
            val_1,
            type_::text,
            case when negate then 'IS NOT DISTINCT FROM' else 'IS DISTINCT FROM' end,
            val_2,
            type_::text
        ) into res;
        return res;
    end if;

    -- IS requires a keyword RHS (NULL, TRUE, FALSE, UNKNOWN), not a typed literal
    if op = 'is' then
        if val_2 not in ('null', 'true', 'false', 'unknown') then
            raise exception 'invalid value for is filter: must be null, true, false, or unknown';
        end if;
        execute format(
            'select %L::%s %s %s',
            val_1,
            type_::text,
            case when negate then 'IS NOT' else 'IS' end,
            upper(val_2)
        ) into res;
        return res;
    end if;

    op_symbol = case
        when op = 'eq'    then '='
        when op = 'neq'   then '!='
        when op = 'lt'    then '<'
        when op = 'lte'   then '<='
        when op = 'gt'    then '>'
        when op = 'gte'   then '>='
        when op = 'in'    then '= any'
        when op = 'like'   then 'LIKE'
        when op = 'ilike'  then 'ILIKE'
        when op = 'match'  then '~'
        when op = 'imatch' then '~*'
        else null
    end;

    if op_symbol is null then
        raise exception 'unsupported equality operator: %', op::text;
    end if;

    execute format(
        'select %L::%s %s (%L::%s)',
        val_1,
        type_::text,
        op_symbol,
        val_2,
        case when op = 'in' then type_::text || '[]' else type_::text end
    ) into res;

    return case when negate then not res else res end;
end;
$$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) OWNER TO supabase_realtime_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
    select
        filters is null
        or array_length(filters, 1) is null
        or coalesce(
            count(col.name) = count(1)
            and sum(
                realtime.check_equality_op(
                    op:=f.op,
                    type_:=coalesce(col.type_oid::regtype, col.type_name::regtype),
                    val_1:=col.value #>> '{}',
                    val_2:=f.value,
                    negate:=coalesce(f.negate, false)
                )::int
            ) filter (where col.name is not null) = count(col.name),
            false
        )
    from
        unnest(filters) f
        left join unnest(columns) col
            on f.column_name = col.name;
$$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_realtime_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS TABLE(wal jsonb, is_rls_enabled boolean, subscription_ids uuid[], errors text[], slot_changes_count bigint)
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
  WITH pub AS (
    SELECT
      concat_ws(
        ',',
        CASE WHEN bool_or(pubinsert) THEN 'insert' ELSE NULL END,
        CASE WHEN bool_or(pubupdate) THEN 'update' ELSE NULL END,
        CASE WHEN bool_or(pubdelete) THEN 'delete' ELSE NULL END
      ) AS w2j_actions,
      coalesce(
        string_agg(
          realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
          ','
        ) filter (WHERE ppt.tablename IS NOT NULL),
        ''
      ) AS w2j_add_tables
    FROM pg_publication pp
    LEFT JOIN pg_publication_tables ppt ON pp.pubname = ppt.pubname
    WHERE pp.pubname = publication
    GROUP BY pp.pubname
    LIMIT 1
  ),
  -- MATERIALIZED ensures pg_logical_slot_get_changes is called exactly once
  w2j AS MATERIALIZED (
    SELECT x.*, pub.w2j_add_tables
    FROM pub,
         pg_logical_slot_get_changes(
           slot_name, null, max_changes,
           'include-pk', 'true',
           'include-transaction', 'false',
           'include-timestamp', 'true',
           'include-type-oids', 'true',
           'format-version', '2',
           'actions', pub.w2j_actions,
           'add-tables', pub.w2j_add_tables
         ) x
  ),
  slot_count AS (
    SELECT count(*)::bigint AS cnt
    FROM w2j
    WHERE w2j.w2j_add_tables <> ''
  ),
  rls_filtered AS (
    SELECT xyz.wal, xyz.is_rls_enabled, xyz.subscription_ids, xyz.errors
    FROM w2j,
         realtime.apply_rls(
           wal := w2j.data::jsonb,
           max_record_bytes := max_record_bytes
         ) xyz(wal, is_rls_enabled, subscription_ids, errors)
    WHERE w2j.w2j_add_tables <> ''
      AND xyz.subscription_ids[1] IS NOT NULL
  )
  SELECT rf.wal, rf.is_rls_enabled, rf.subscription_ids, rf.errors, sc.cnt
  FROM rls_filtered rf, slot_count sc

  UNION ALL

  SELECT null, null, null, null, sc.cnt
  FROM slot_count sc
  WHERE NOT EXISTS (SELECT 1 FROM rls_filtered)
$$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_realtime_admin;

--
-- Name: list_changes_sync(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.list_changes_sync(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS TABLE(wal jsonb, is_rls_enabled boolean, subscription_ids uuid[], errors text[], slot_changes_count bigint)
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
  WITH pub AS (
    SELECT
      concat_ws(
        ',',
        CASE WHEN bool_or(pubinsert) THEN 'insert' ELSE NULL END,
        CASE WHEN bool_or(pubupdate) THEN 'update' ELSE NULL END,
        CASE WHEN bool_or(pubdelete) THEN 'delete' ELSE NULL END
      ) AS w2j_actions,
      coalesce(
        string_agg(
          realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
          ','
        ) filter (WHERE ppt.tablename IS NOT NULL),
        ''
      ) AS w2j_add_tables
    FROM pg_publication pp
    LEFT JOIN pg_publication_tables ppt ON pp.pubname = ppt.pubname
    WHERE pp.pubname = publication
    GROUP BY pp.pubname
    LIMIT 1
  ),
  -- MATERIALIZED ensures the slot is read exactly once.
  consumed AS MATERIALIZED (
    SELECT x.*, pub.w2j_add_tables
    FROM pub,
         realtime.settled_changes(
           slot_name, max_changes,
           'include-pk', 'true',
           'include-transaction', 'false',
           'include-timestamp', 'true',
           'include-type-oids', 'true',
           'format-version', '2',
           'actions', pub.w2j_actions,
           'add-tables', pub.w2j_add_tables
         ) x
  ),
  slot_count AS (
    SELECT count(*)::bigint AS cnt
    FROM consumed
    WHERE consumed.w2j_add_tables <> ''
  ),
  rls_filtered AS (
    SELECT xyz.wal, xyz.is_rls_enabled, xyz.subscription_ids, xyz.errors
    FROM consumed,
         realtime.apply_rls(
           wal := consumed.data::jsonb,
           max_record_bytes := max_record_bytes
         ) xyz(wal, is_rls_enabled, subscription_ids, errors)
    WHERE consumed.w2j_add_tables <> ''
      AND xyz.subscription_ids[1] IS NOT NULL
  )
  SELECT rf.wal, rf.is_rls_enabled, rf.subscription_ids, rf.errors, sc.cnt
  FROM rls_filtered rf, slot_count sc

  UNION ALL

  SELECT null, null, null, null, sc.cnt
  FROM slot_count sc
  WHERE NOT EXISTS (SELECT 1 FROM rls_filtered)
$$;


ALTER FUNCTION realtime.list_changes_sync(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_realtime_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  SELECT
    realtime.wal2json_escape_identifier(nsp.nspname::text)
    || '.'
    || realtime.wal2json_escape_identifier(pc.relname::text)
  FROM pg_class pc
  JOIN pg_namespace nsp ON pc.relnamespace = nsp.oid
  WHERE pc.oid = entity
$$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_realtime_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_realtime_admin;

--
-- Name: send_binary(bytea, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, binary_payload, event, topic, private, extension)
    VALUES (generated_id, payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) OWNER TO supabase_realtime_admin;

--
-- Name: settled_changes(name, integer, text[]); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.settled_changes(slot_name name, max_changes integer, VARIADIC opts text[]) RETURNS TABLE(lsn pg_lsn, xid xid, data text)
    LANGUAGE plpgsql
    AS $$
declare
  upto pg_lsn;
  total bigint;
  xids xid[];
  starts bigint[];
  snapshot pg_snapshot;
  running_xids xid[];
  xmax_age int;
  cut bigint;
begin
  -- Each statement in a volatile function takes its own snapshot, which is what lets the
  -- check below see a writer that was still in flight when the peek ran. Under REPEATABLE
  -- READ the snapshot never advances, so a deferred change would never be released.
  if current_setting('transaction_isolation') <> 'read committed' then
    raise exception 'realtime.settled_changes requires READ COMMITTED';
  end if;

  -- The peek and the read below cover the same WAL, so the read cannot reach a commit the
  -- check never saw.
  upto := pg_current_wal_flush_lsn();

  -- One entry per transaction, in commit order: its xid and the position of its first
  -- change. The peek uses the caller's own options, so max_changes counts exactly what the
  -- read counts. A non-transactional logical message is emitted as soon as it is decoded,
  -- tagged with the xid of whatever transaction wrote it, so it does not mark where that
  -- transaction starts.
  select coalesce(sum(g.n), 0),
         array_agg(g.x order by g.first) filter (where g.first is not null),
         array_agg(g.first order by g.first) filter (where g.first is not null)
    into total, xids, starts
    from (
      select p.xid as x, count(*) as n,
             min(p.ord) filter (where not case
               when starts_with(p.data, '{"action":"M"') then (p.data::jsonb->>'transactional')::boolean is false
               else false
             end) as first
      from pg_logical_slot_peek_changes(slot_name, upto, max_changes, variadic opts)
           with ordinality as p(lsn, xid, data, ord)
      group by p.xid
    ) g;

  -- Nothing for the caller, but the slot still has to move past what the peek covered.
  if total = 0 then
    perform pg_replication_slot_advance(slot_name, upto);
    return;
  end if;

  if xids is not null then
    -- Taken after the peek is materialized, so a writer that was still in flight during
    -- decoding is guaranteed to show up here.
    snapshot := pg_current_snapshot();

    -- A commit record reaches the WAL before the writer leaves the proc array, so a change
    -- can be decoded while its row is invisible. apply_rls would resolve a policy against a
    -- row it cannot see and authorize it for nobody, while the read consumed it regardless.
    --
    -- xip lists transactions running when the snapshot was taken. It does not cover a writer
    -- whose xid sits at or beyond xmax, which never appears there, so the horizon is checked
    -- too. age() counts backwards from the current xid and so compares correctly across
    -- wraparound.
    select coalesce(array_agg(running.x::xid), array[]::xid[])
      into running_xids
      from pg_snapshot_xip(snapshot) running(x);
    xmax_age := age(pg_snapshot_xmax(snapshot)::xid);

    select min(u.s) into cut
      from unnest(xids, starts) as u(x, s)
      where u.x = any(running_xids) or age(u.x) <= xmax_age;
  end if;

  -- The read stops right after the commit that brings its count to upto_nchanges, so the
  -- count of changes in front of the first unsettled transaction stops it just before that
  -- transaction.
  if cut is null then
    return query
      select p.* from pg_logical_slot_get_changes(slot_name, upto, max_changes, variadic opts) p;
  elsif cut > 1 then
    return query
      select p.* from pg_logical_slot_get_changes(slot_name, upto, (cut - 1)::int, variadic opts) p;
  end if;
end;
$$;


ALTER FUNCTION realtime.settled_changes(slot_name name, max_changes integer, VARIADIC opts text[]) OWNER TO supabase_realtime_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
    col_names text[] = coalesce(
            array_agg(a.attname order by a.attnum),
            '{}'::text[]
        )
        from
            pg_catalog.pg_attribute a
        where
            a.attrelid = new.entity
            and a.attnum > 0
            and not a.attisdropped
            and pg_catalog.has_column_privilege(
                (new.claims ->> 'role'),
                a.attrelid,
                a.attnum,
                'SELECT'
            );
    filter realtime.user_defined_filter;
    col_type regtype;
    in_val jsonb;
    selected_col text;
begin
    for filter in select * from unnest(new.filters) loop
        if not filter.column_name = any(col_names) then
            raise exception 'invalid column for filter %', filter.column_name;
        end if;

        col_type = (
            select atttypid::regtype
            from pg_catalog.pg_attribute
            where attrelid = new.entity
                  and attname = filter.column_name
        );
        if col_type is null then
            raise exception 'failed to lookup type for column %', filter.column_name;
        end if;

        if filter.op = 'in'::realtime.equality_op then
            in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
            if coalesce(jsonb_array_length(in_val), 0) > 100 then
                raise exception 'too many values for `in` filter. Maximum 100';
            end if;
        elsif filter.op = 'is'::realtime.equality_op then
            -- `is` requires a keyword RHS rather than a typed literal
            if filter.value not in ('null', 'true', 'false', 'unknown') then
                raise exception 'invalid value for is filter: must be null, true, false, or unknown';
            end if;
            -- IS NULL works for any type, but IS TRUE/FALSE/UNKNOWN require a boolean
            -- operand. Reject the non-null keywords on non-boolean columns here so they
            -- don't abort apply_rls at WAL time.
            if filter.value <> 'null' and col_type <> 'boolean'::regtype then
                raise exception 'is % filter requires a boolean column, got %', filter.value, col_type::text;
            end if;
        elsif filter.op in ('like'::realtime.equality_op, 'ilike'::realtime.equality_op) then
            -- like/ilike apply the text pattern operator (~~); reject column types that
            -- have no such operator instead of failing at WAL time
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = '~~' and oprleft = col_type
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
        elsif filter.op in ('match'::realtime.equality_op, 'imatch'::realtime.equality_op) then
            -- match/imatch apply the regex operators ~ / ~*; reject column types that have
            -- no such operator (e.g. integer) instead of failing at WAL time, mirroring the
            -- like/ilike guard above.
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = case when filter.op = 'imatch'::realtime.equality_op then '~*' else '~' end
                  and oprleft = col_type
                  and oprright = col_type
                  and oprresult = 'boolean'::regtype
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
            -- validate the regex eagerly so a bad pattern is rejected here, not inside
            -- apply_rls where it would abort the WAL stream for the entity
            begin
                perform '' ~ filter.value;
            exception when others then
                raise exception 'invalid regular expression for % filter: %', filter.op::text, sqlerrm;
            end;
        else
            -- eq/neq/lt/lte/gt/gte: value must be coercable to the type
            perform realtime.cast(filter.value, col_type);
        end if;
    end loop;

    if new.selected_columns is not null then
        for selected_col in select * from unnest(new.selected_columns) loop
            if not selected_col = any(col_names) then
                raise exception 'invalid column for select %', selected_col;
            end if;
        end loop;
    end if;

    -- Apply consistent order to filters so the unique constraint can't be tricked by a
    -- different filter order. negate is part of the sort key.
    new.filters = coalesce(
        array_agg(f order by f.column_name, f.op, f.value, f.negate),
        '{}'
    ) from unnest(new.filters) f;

    -- Normalize selected_columns order so ARRAY['a','b'] and ARRAY['b','a'] are treated
    -- as the same subscription group in apply_rls. Preserve an empty array as '{}'
    -- ("primary keys only") so it stays distinct from NULL ("all columns"); array_agg
    -- over an empty set would otherwise collapse '{}' back to NULL.
    if new.selected_columns is not null then
        new.selected_columns = coalesce(
            (
                select array_agg(c order by c)
                from unnest(new.selected_columns) c
            ),
            '{}'::text[]
        );
    end if;

    return new;
end;
$$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_realtime_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_realtime_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: wal2json_escape_identifier(text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.wal2json_escape_identifier(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  -- Prefix `\`, `,`, `.`, and any whitespace with `\`
  SELECT regexp_replace(name, '([\\,.[:space:]])', '\\\1', 'g')
$$;


ALTER FUNCTION realtime.wal2json_escape_identifier(name text) OWNER TO supabase_realtime_admin;

--
-- Name: allow_any_operation(text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.allow_any_operation(expected_operations text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );
$$;


ALTER FUNCTION storage.allow_any_operation(expected_operations text[]) OWNER TO supabase_storage_admin;

--
-- Name: allow_only_operation(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.allow_only_operation(expected_operation text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;
$$;


ALTER FUNCTION storage.allow_only_operation(expected_operation text) OWNER TO supabase_storage_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_lifecycle_service_role(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_lifecycle_service_role() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog'
    AS $$
BEGIN
  IF current_user::text IS DISTINCT FROM TG_ARGV[0]
     AND (
       OLD.lifecycle_configuration IS DISTINCT FROM NEW.lifecycle_configuration
       OR OLD.lifecycle_configuration_generation IS DISTINCT FROM NEW.lifecycle_configuration_generation
     ) THEN
    -- AFTER runs only after caller RLS has accepted the proposed row. The API
    -- recognizes this specific error after rolling back its permission probe;
    -- direct non-service writes still fail and cannot persist the change.
    RAISE EXCEPTION 'bucket control columns may only be changed by the configured storage service role'
      USING ERRCODE = 'PST01',
            SCHEMA = TG_TABLE_SCHEMA,
            TABLE = TG_TABLE_NAME,
            CONSTRAINT = TG_NAME;
  END IF;

  RETURN NULL;
END;
$$;


ALTER FUNCTION storage.enforce_bucket_lifecycle_service_role() OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Get the last path segment (the actual filename)
    SELECT _parts[array_length(_parts, 1)] INTO _filename;
    -- Extract extension: reverse, split on '.', then reverse again
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    RETURN _parts[array_length(_parts, 1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN p_delimiter <> ''
         AND position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(
        p_key,
        length(p_prefix)
            + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1))
            + length(p_delimiter) - 1
    )
    ELSE NULL
END;
$$;


ALTER FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket(noncurrent_versions text DEFAULT 'include'::text, delete_markers text DEFAULT 'include'::text) RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    -- COALESCE first: NULL NOT IN (...) evaluates to NULL (not TRUE), so a
    -- bare NOT IN check silently leaves an explicit NULL argument unreset.
    noncurrent_versions := COALESCE(noncurrent_versions, 'include');
    delete_markers := COALESCE(delete_markers, 'include');
    IF noncurrent_versions NOT IN ('exclude', 'only', 'include') THEN
        noncurrent_versions := 'include';
    END IF;
    IF delete_markers NOT IN ('exclude', 'only', 'include') THEN
        delete_markers := 'include';
    END IF;

    return query
        select sum((metadata->>'size')::bigint)::bigint as size, obj.bucket_id
        from "storage".objects as obj
        where (noncurrent_versions != 'exclude' OR obj.archived_at IS NULL)
          and (noncurrent_versions != 'only' OR obj.archived_at IS NOT NULL)
          and (delete_markers != 'exclude' OR NOT obj.is_delete_marker)
          and (delete_markers != 'only' OR obj.is_delete_marker)
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket(noncurrent_versions text, delete_markers text) OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text, raw_prefix_param text DEFAULT NULL::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE sql STABLE
    AS $_$
WITH candidates AS (
    SELECT
        upload.key AS object_key,
        CASE
            WHEN position($3 IN substring(upload.key FROM length(coalesce($7, $2)) + 1)) > 0
            THEN left(
                upload.key,
                length(coalesce($7, $2))
                    + position($3 IN substring(upload.key FROM length(coalesce($7, $2)) + 1))
                    + length($3) - 1
            )
            ELSE upload.key
        END AS result_key,
        upload.id,
        upload.created_at,
        position($3 IN substring(upload.key FROM length(coalesce($7, $2)) + 1)) > 0 AS is_common_prefix
    FROM storage.s3_multipart_uploads AS upload
    WHERE upload.bucket_id = $1
      AND upload.key COLLATE "C" LIKE $2 || '%'
), filtered AS (
    SELECT candidate.*
    FROM candidates AS candidate
    WHERE $5 = ''
       OR candidate.result_key COLLATE "C" > $5
       OR (
           candidate.result_key COLLATE "C" = $5
           AND NOT candidate.is_common_prefix
           AND $6 <> ''
           -- A completed or aborted marker repeats the remaining same-key uploads.
           AND COALESCE(
               (candidate.created_at, candidate.id COLLATE "C") > (
                   SELECT marker.created_at, marker.id COLLATE "C"
                   FROM storage.s3_multipart_uploads AS marker
                   WHERE marker.bucket_id = $1
                     AND marker.key COLLATE "C" = $5
                     AND marker.id = $6
               ),
               TRUE
           )
       )
), ranked AS (
    SELECT
        filtered.*,
        row_number() OVER (
            PARTITION BY filtered.result_key COLLATE "C"
            ORDER BY filtered.created_at, filtered.id COLLATE "C"
        ) AS prefix_rank
    FROM filtered
)
SELECT ranked.result_key, ranked.id, ranked.created_at
FROM ranked
WHERE NOT ranked.is_common_prefix OR ranked.prefix_rank = 1
ORDER BY ranked.result_key COLLATE "C", ranked.created_at, ranked.id COLLATE "C"
LIMIT $4;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text, raw_prefix_param text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text, text, text, timestamp with time zone, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, noncurrent_versions text DEFAULT 'exclude'::text, delete_markers text DEFAULT 'exclude'::text, next_token_archived_at timestamp with time zone DEFAULT NULL::timestamp with time zone, next_token_version text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, version text, archived_at timestamp with time zone, is_delete_marker boolean, is_versioned boolean)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_start_relative TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;
    v_version_filter TEXT;

    -- true when noncurrent_versions can return >1 row per name; keeps them
    -- ordered most-recent-first and lets pagination resume mid-key
    v_multi_row BOOLEAN;
    v_name_order TEXT;
    v_exact_range_predicate TEXT;
    v_strict_range_predicate TEXT;
    v_inclusive_range_predicate TEXT;

    -- Seek state for the current name. archived_at is normalized to JavaScript's
    -- millisecond precision and version breaks ties within the same millisecond.
    -- Current rows use 'infinity'; NULL means no tiebreak has been established.
    v_next_seek TEXT;
    v_next_seek_at TIMESTAMPTZ;
    v_next_seek_version TEXT;
    v_next_seek_strict BOOLEAN := false;
    v_cursor_is_folder BOOLEAN;
    v_count INT := 0;
    v_previous_seek TEXT;
    v_previous_seek_at TIMESTAMPTZ;
    v_previous_seek_version TEXT;
    v_previous_count INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;
    v_batch_query_strict TEXT;
    v_delete_marker_peek_query TEXT;
    v_delete_marker_peek_query_strict TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);
    v_next_seek_at := NULL;
    v_next_seek_version := '';

    -- COALESCE first: NULL NOT IN (...) evaluates to NULL (not TRUE), so a
    -- bare NOT IN check silently leaves an explicit NULL argument unreset.
    noncurrent_versions := COALESCE(noncurrent_versions, 'exclude');
    delete_markers := COALESCE(delete_markers, 'exclude');
    IF noncurrent_versions NOT IN ('exclude', 'only', 'include') THEN
        noncurrent_versions := 'exclude';
    END IF;
    IF delete_markers NOT IN ('exclude', 'only', 'include') THEN
        delete_markers := 'exclude';
    END IF;

    v_multi_row := noncurrent_versions IN ('only', 'include');
    v_name_order := CASE WHEN v_is_asc THEN 'ASC' ELSE 'DESC' END;

    v_version_filter := '';
    IF noncurrent_versions = 'exclude' THEN
        v_version_filter := v_version_filter || ' AND o.archived_at IS NULL';
    ELSIF noncurrent_versions = 'only' THEN
        v_version_filter := v_version_filter || ' AND o.archived_at IS NOT NULL';
    END IF;
    IF delete_markers = 'exclude' THEN
        v_version_filter := v_version_filter || ' AND NOT o.is_delete_marker';
    ELSIF delete_markers = 'only' THEN
        v_version_filter := v_version_filter || ' AND o.is_delete_marker';
    END IF;

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Keep caller-provided cursors inside the requested prefix range.
    IF v_start <> '' AND v_upper_bound IS NOT NULL THEN
        IF v_is_asc THEN
            IF v_start COLLATE "C" < v_prefix COLLATE "C" THEN
                v_start := '';
            ELSIF v_start COLLATE "C" >= v_upper_bound COLLATE "C" THEN
                RETURN;
            END IF;
        ELSE
            IF v_start COLLATE "C" < v_prefix COLLATE "C" THEN
                RETURN;
            ELSIF v_start COLLATE "C" >= v_upper_bound COLLATE "C" THEN
                v_start := '';
            END IF;
        END IF;
    END IF;

    v_start_relative := substring(v_start FROM length(v_prefix) + 1);

    -- Direction affects only the indexed name range and its ordering. Cursor
    -- state transitions and within-key version ordering stay shared.
    IF v_is_asc THEN
        v_exact_range_predicate := 'TRUE';
        v_strict_range_predicate := 'o.name COLLATE "C" > $2';
        v_inclusive_range_predicate := 'o.name COLLATE "C" >= $2';
        IF v_upper_bound IS NOT NULL THEN
            v_exact_range_predicate := 'o.name COLLATE "C" < $3';
            v_strict_range_predicate := v_strict_range_predicate || ' AND o.name COLLATE "C" < $3';
            v_inclusive_range_predicate := v_inclusive_range_predicate || ' AND o.name COLLATE "C" < $3';
        END IF;
    ELSE
        v_exact_range_predicate := 'TRUE';
        v_strict_range_predicate := 'o.name COLLATE "C" < $2';
        v_inclusive_range_predicate := 'o.name COLLATE "C" < $2';
        IF v_prefix <> '' THEN
            v_exact_range_predicate := 'o.name COLLATE "C" >= $3';
            v_strict_range_predicate := v_strict_range_predicate || ' AND o.name COLLATE "C" >= $3';
            v_inclusive_range_predicate := v_inclusive_range_predicate || ' AND o.name COLLATE "C" >= $3';
        END IF;
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    -- The multi-row order matches the externally serialized cursor exactly:
    -- archived_at at millisecond precision, then version as the final tiebreak.
    --
    -- When v_multi_row, the seek is a keyset tuple comparison ("name > $2 OR
    -- (name = $2 AND tiebreak)") - Postgres won't split that OR into indexable
    -- form (confirmed even with fully literal values), so as one WHERE clause
    -- it forces a full bucket scan filtered row-by-row. Splitting it into two
    -- independently-indexable branches (exact name match with the tiebreak
    -- filter, vs. strictly-past names) combined with UNION ALL lets each
    -- branch keep name as a real index condition; the outer ORDER BY/LIMIT
    -- re-merges them into the same page the single query used to produce.
    IF v_multi_row THEN
        v_batch_query := format(
            $sql$
            SELECT *
            FROM (
                (
                    SELECT o.name, o.id, o.updated_at, o.created_at,
                           o.last_accessed_at, o.metadata, o.version,
                           o.archived_at, o.is_delete_marker, o.is_versioned
                    FROM storage.objects o
                    WHERE o.bucket_id = $1
                      AND o.name COLLATE "C" = $2
                      AND %s
                      AND NOT $7::boolean
                      AND (
                          $5::timestamptz IS NULL
                          OR COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) < $5
                          OR (
                              COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) = $5
                              AND COALESCE(o.version, '') > $6
                          )
                      )
                      %s
                    ORDER BY
                        COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) DESC,
                        COALESCE(o.version, '') ASC
                    LIMIT $4
                )
                UNION ALL
                (
                    SELECT o.name, o.id, o.updated_at, o.created_at,
                           o.last_accessed_at, o.metadata, o.version,
                           o.archived_at, o.is_delete_marker, o.is_versioned
                    FROM storage.objects o
                    WHERE o.bucket_id = $1
                      AND %s
                      %s
                    ORDER BY
                        o.name COLLATE "C" %s,
                        COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) DESC,
                        COALESCE(o.version, '') ASC
                    LIMIT $4
                )
            ) sub
            ORDER BY
                sub.name COLLATE "C" %s,
                COALESCE(date_trunc('milliseconds', sub.archived_at), 'infinity'::timestamptz) DESC,
                COALESCE(sub.version, '') ASC
            LIMIT $4
            $sql$,
            v_exact_range_predicate,
            v_version_filter,
            v_strict_range_predicate,
            v_version_filter,
            v_name_order,
            v_name_order
        );
    ELSE
        v_batch_query := format(
            $sql$
            SELECT o.name, o.id, o.updated_at, o.created_at,
                   o.last_accessed_at, o.metadata, o.version,
                   o.archived_at, o.is_delete_marker, o.is_versioned
            FROM storage.objects o
            WHERE o.bucket_id = $1
              AND %s
              %s
            ORDER BY o.name COLLATE "C" %s, o.archived_at DESC
            LIMIT $4
            $sql$,
            v_inclusive_range_predicate,
            v_version_filter,
            v_name_order
        );

        -- Strict counterpart of the query above: used once the single-row
        -- ASC batch advance (below) has left v_next_seek pointing at the
        -- last row already emitted, so an inclusive predicate would
        -- re-match it forever. Only single-row mode ever sets strict mode,
        -- so this variant is never needed when v_multi_row.
        v_batch_query_strict := format(
            $sql$
            SELECT o.name, o.id, o.updated_at, o.created_at,
                   o.last_accessed_at, o.metadata, o.version,
                   o.archived_at, o.is_delete_marker, o.is_versioned
            FROM storage.objects o
            WHERE o.bucket_id = $1
              AND %s
              %s
            ORDER BY o.name COLLATE "C" %s, o.archived_at DESC
            LIMIT $4
            $sql$,
            v_strict_range_predicate,
            v_version_filter,
            v_name_order
        );
    END IF;

    -- The static peek predicates cannot use the partial delete-marker index
    -- once PL/pgSQL switches to a generic plan because whether
    -- is_delete_marker is required remains parameter-dependent. Reuse the
    -- already-specialized batch query with a one-row limit for this sparse
    -- filter so the plan sees a literal `o.is_delete_marker` predicate.
    IF delete_markers = 'only' THEN
        v_delete_marker_peek_query :=
            'SELECT marker_page.name FROM (' || v_batch_query || ') marker_page LIMIT 1';
        IF NOT v_multi_row THEN
            v_delete_marker_peek_query_strict :=
                'SELECT marker_page.name FROM (' || v_batch_query_strict || ') marker_page LIMIT 1';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor performs one specialized initial seek so
            -- partial current-version and delete-marker indexes remain available.
            EXECUTE format(
                'SELECT o.name FROM storage.objects o WHERE o.bucket_id = $1%s%s ORDER BY o.name COLLATE "C" DESC LIMIT 1',
                CASE WHEN v_upper_bound IS NOT NULL
                    THEN ' AND o.name COLLATE "C" >= $2 AND o.name COLLATE "C" < $3'
                    ELSE ''
                END,
                v_version_filter
            )
            INTO v_next_seek
            USING _bucket_id, v_prefix, v_upper_bound;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Folder continuation tokens retain their trailing delimiter. A
        -- delimiter-less startAfter is always a literal key boundary.
        v_cursor_is_folder := delimiter_param <> ''
            AND v_start_relative <> ''
            AND right(v_start_relative, length(delimiter_param)) = delimiter_param;

        IF v_cursor_is_folder THEN
            v_next_seek := CASE
                WHEN right(v_start, length(delimiter_param)) = delimiter_param
                    THEN v_start
                ELSE v_start || delimiter_param
            END;
            IF v_is_asc THEN
                v_next_seek := left(v_next_seek, -1)
                    || chr(ascii(right(v_next_seek, 1)) + 1);
            END IF;
            v_next_seek_strict := NOT v_is_asc;
        ELSE
            -- leaf object: when v_multi_row, stay on v_start with the
            -- caller-supplied tiebreak so a page boundary mid-key resumes
            -- that key's remaining rows instead of skipping them. Truncate
            -- to milliseconds like every other v_next_seek_at assignment -
            -- harmless today since object.ts's cursor always round-trips
            -- through JS Date first, but this shouldn't rely on that.
            IF v_multi_row THEN
                v_next_seek := v_start;
                v_next_seek_at := date_trunc('milliseconds', next_token_archived_at);
                v_next_seek_version := coalesce(next_token_version, '');
                v_next_seek_strict := coalesce(next_token, '') = '';
            ELSIF v_is_asc THEN
                v_next_seek := v_start;
                v_next_seek_strict := true;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        v_previous_seek := v_next_seek;
        v_previous_seek_at := v_next_seek_at;
        v_previous_seek_version := v_next_seek_version;
        v_previous_count := v_count;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        -- v_multi_row is branched here (rather than folded into the WHERE
        -- clause as a bound parameter) so each concrete query keeps an
        -- unconditional seek predicate - once PL/pgSQL switches to its
        -- cached generic plan (after 5 calls), a parameter-gated
        -- "(NOT v_multi_row AND name >= $x) OR (v_multi_row AND ...)"
        -- predicate stops the planner from using name as an index
        -- condition at all, degrading every subsequent peek to a full
        -- index scan filtered row-by-row instead of a bounded range scan.
        -- v_multi_row's seek predicate is a keyset tuple comparison
        -- ("name > x OR (name = x AND tiebreak)") - Postgres does not
        -- split this OR into indexable form even with fully literal
        -- values, so it falls back to a full scan filtered row-by-row.
        -- Splitting it into two independently-indexable branches (exact
        -- name match with the tiebreak filter, vs. strictly-past name)
        -- combined with UNION ALL lets each branch keep name as a real
        -- index condition; the outer ORDER BY/LIMIT picks whichever of
        -- the (at most 2) rows sorts first.
        IF delete_markers = 'only' THEN
            EXECUTE CASE WHEN v_next_seek_strict AND NOT v_multi_row
                THEN v_delete_marker_peek_query_strict
                ELSE v_delete_marker_peek_query
            END
                INTO v_peek_name
                USING _bucket_id, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END,
                    1, v_next_seek_at, v_next_seek_version, v_next_seek_strict;
        ELSIF v_multi_row THEN
            IF v_is_asc THEN
                IF v_upper_bound IS NOT NULL THEN
                    SELECT sub.name INTO v_peek_name FROM (
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" = v_next_seek
                           AND o.name COLLATE "C" < v_upper_bound
                           AND NOT v_next_seek_strict
                           AND (v_next_seek_at IS NULL
                                OR COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) < v_next_seek_at
                                OR (COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) = v_next_seek_at
                                    AND COALESCE(o.version, '') > v_next_seek_version))
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) DESC, COALESCE(o.version, '') ASC LIMIT 1)
                        UNION ALL
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" > v_next_seek AND o.name COLLATE "C" < v_upper_bound
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY o.name COLLATE "C" ASC LIMIT 1)
                    ) sub ORDER BY sub.name COLLATE "C" ASC LIMIT 1;
                ELSE
                    SELECT sub.name INTO v_peek_name FROM (
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" = v_next_seek
                           AND NOT v_next_seek_strict
                           AND (v_next_seek_at IS NULL
                                OR COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) < v_next_seek_at
                                OR (COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) = v_next_seek_at
                                    AND COALESCE(o.version, '') > v_next_seek_version))
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) DESC, COALESCE(o.version, '') ASC LIMIT 1)
                        UNION ALL
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" > v_next_seek
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY o.name COLLATE "C" ASC LIMIT 1)
                    ) sub ORDER BY sub.name COLLATE "C" ASC LIMIT 1;
                END IF;
            ELSE
                IF v_upper_bound IS NOT NULL THEN
                    SELECT sub.name INTO v_peek_name FROM (
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" = v_next_seek
                           AND o.name COLLATE "C" >= v_prefix
                           AND NOT v_next_seek_strict
                           AND (v_next_seek_at IS NULL
                                OR COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) < v_next_seek_at
                                OR (COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) = v_next_seek_at
                                    AND COALESCE(o.version, '') > v_next_seek_version))
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) DESC, COALESCE(o.version, '') ASC LIMIT 1)
                        UNION ALL
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY o.name COLLATE "C" DESC LIMIT 1)
                    ) sub ORDER BY sub.name COLLATE "C" DESC LIMIT 1;
                ELSE
                    SELECT sub.name INTO v_peek_name FROM (
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" = v_next_seek
                           AND NOT v_next_seek_strict
                           AND (v_next_seek_at IS NULL
                                OR COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) < v_next_seek_at
                                OR (COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) = v_next_seek_at
                                    AND COALESCE(o.version, '') > v_next_seek_version))
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) DESC, COALESCE(o.version, '') ASC LIMIT 1)
                        UNION ALL
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY o.name COLLATE "C" DESC LIMIT 1)
                    ) sub ORDER BY sub.name COLLATE "C" DESC LIMIT 1;
                END IF;
            END IF;
        ELSE
            -- Single-row mode is always noncurrent_versions='exclude'. Keep
            -- this predicate literal so generic plans use the current index.
            IF v_is_asc THEN
                IF v_next_seek_strict AND v_upper_bound IS NOT NULL THEN
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = _bucket_id
                      AND o.name COLLATE "C" > v_next_seek
                      AND o.name COLLATE "C" < v_upper_bound
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                      AND (delete_markers != 'only' OR o.is_delete_marker)
                    ORDER BY o.name COLLATE "C" ASC LIMIT 1;
                ELSIF v_next_seek_strict THEN
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = _bucket_id
                      AND o.name COLLATE "C" > v_next_seek
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                      AND (delete_markers != 'only' OR o.is_delete_marker)
                    ORDER BY o.name COLLATE "C" ASC LIMIT 1;
                ELSIF v_upper_bound IS NOT NULL THEN
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = _bucket_id
                      AND o.name COLLATE "C" >= v_next_seek
                      AND o.name COLLATE "C" < v_upper_bound
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                      AND (delete_markers != 'only' OR o.is_delete_marker)
                    ORDER BY o.name COLLATE "C" ASC LIMIT 1;
                ELSE
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = _bucket_id
                      AND o.name COLLATE "C" >= v_next_seek
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                      AND (delete_markers != 'only' OR o.is_delete_marker)
                    ORDER BY o.name COLLATE "C" ASC LIMIT 1;
                END IF;
            ELSE
                IF v_upper_bound IS NOT NULL THEN
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = _bucket_id
                      AND o.name COLLATE "C" < v_next_seek
                      AND o.name COLLATE "C" >= v_prefix
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                      AND (delete_markers != 'only' OR o.is_delete_marker)
                    ORDER BY o.name COLLATE "C" DESC LIMIT 1;
                ELSE
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = _bucket_id
                      AND o.name COLLATE "C" < v_next_seek
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                      AND (delete_markers != 'only' OR o.is_delete_marker)
                    ORDER BY o.name COLLATE "C" DESC LIMIT 1;
                END IF;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := v_common_prefix;
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            version := NULL;
            archived_at := NULL;
            is_delete_marker := NULL;
            is_versioned := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1)
                    || chr(ascii(right(v_common_prefix, 1)) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
            v_next_seek_at := NULL;
            v_next_seek_version := '';
            v_next_seek_strict := NOT v_is_asc;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE CASE WHEN v_next_seek_strict AND NOT v_multi_row THEN v_batch_query_strict ELSE v_batch_query END
                USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size, v_next_seek_at, v_next_seek_version,
                v_next_seek_strict
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it. Reset
                    -- strict mode too it may have been set by an earlier
                    -- row in this same batch (see the single-row ASC advance
                    -- below), and v_next_seek here is the folder-triggering
                    -- row's own name, which the next peek must find inclusively.
                    v_next_seek := CASE
                        WHEN v_is_asc THEN v_current.name
                        ELSE v_current.name || delimiter_param
                    END;
                    v_next_seek_at := NULL;
                    v_next_seek_version := '';
                    v_next_seek_strict := false;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                version := v_current.version;
                archived_at := v_current.archived_at;
                is_delete_marker := v_current.is_delete_marker;
                is_versioned := v_current.is_versioned;
                RETURN NEXT;
                v_count := v_count + 1;

                -- when v_multi_row, stay on this name and record its
                -- archived_at as the new tiebreak so remaining rows for the
                -- same key are picked up before moving to the next name
                IF v_multi_row THEN
                    v_next_seek := v_current.name;
                    v_next_seek_at := COALESCE(date_trunc('milliseconds', v_current.archived_at), 'infinity'::timestamptz);
                    v_next_seek_version := COALESCE(v_current.version, '');
                    v_next_seek_strict := false;
                ELSIF v_is_asc THEN
                    -- Appending the delimiter as a fake lexical successor
                    -- would skip a real key like `name || '!'` (or any
                    -- character sorting below the delimiter), which sorts
                    -- between `name` and `name || delimiter`. Track the real
                    -- name and mark the next comparison strict instead.
                    v_next_seek := v_current.name;
                    v_next_seek_strict := true;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;

        IF v_count = v_previous_count
           AND v_next_seek IS NOT DISTINCT FROM v_previous_seek
           AND v_next_seek_at IS NOT DISTINCT FROM v_previous_seek_at
           AND v_next_seek_version IS NOT DISTINCT FROM v_previous_seek_version THEN
            RAISE EXCEPTION 'storage.list_objects_with_delimiter made no progress at seek (%, %, %)',
                v_next_seek, v_next_seek_at, v_next_seek_version;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text, sort_order text, noncurrent_versions text, delete_markers text, next_token_archived_at timestamp with time zone, next_token_version text) OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: protect_bucket_control_columns(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.protect_bucket_control_columns() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  configuration_changed boolean;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.lifecycle_configuration IS NOT NULL
       OR NEW.lifecycle_configuration_generation IS NOT NULL THEN
      IF NOT pg_has_role(current_user, TG_ARGV[0], 'MEMBER') THEN
        RAISE EXCEPTION 'only members of the configured storage service role may insert lifecycle policy state'
          USING ERRCODE = '42501',
                HINT = format(
                  'Insert with both lifecycle columns NULL and configure lifecycle through the Storage API afterward, or insert as a member of %I.',
                  TG_ARGV[0]
                );
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  configuration_changed =
    OLD.lifecycle_configuration IS DISTINCT FROM NEW.lifecycle_configuration
    OR OLD.lifecycle_configuration_generation IS DISTINCT FROM NEW.lifecycle_configuration_generation;

  IF NOT configuration_changed THEN
    RETURN NEW;
  END IF;

  IF NEW.type IS DISTINCT FROM 'STANDARD' THEN
    RAISE EXCEPTION 'bucket versioning and lifecycle controls require a Standard bucket'
      USING ERRCODE = '0A000';
  END IF;

  IF NEW.lifecycle_configuration IS NULL
     AND NEW.lifecycle_configuration_generation IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.lifecycle_configuration IS NULL
     OR NEW.lifecycle_configuration_generation IS NULL
     OR OLD.lifecycle_configuration IS NOT DISTINCT FROM NEW.lifecycle_configuration
     OR OLD.lifecycle_configuration_generation IS NOT DISTINCT FROM NEW.lifecycle_configuration_generation THEN
    RAISE EXCEPTION 'a changed lifecycle policy requires a new non-null generation'
      USING ERRCODE = '22023';
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION storage.protect_bucket_control_columns() OWNER TO supabase_storage_admin;

--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.protect_delete() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text, noncurrent_versions text DEFAULT 'exclude'::text, delete_markers text DEFAULT 'exclude'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb, version text, archived_at timestamp with time zone, is_delete_marker boolean, is_versioned boolean)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_prefix_len INT;
    v_prefix_start INT;
    v_combined_levels INT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;
    v_version_filter TEXT;
    v_multi_row BOOLEAN;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;
    v_delete_marker_peek_query TEXT;
    v_delete_marker_peek_query_strict TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_next_seek_at TIMESTAMPTZ;
    v_next_seek_version TEXT;
    v_next_seek_strict BOOLEAN := false;
    v_count INT := 0;
    v_skipped INT := 0;
    v_previous_seek TEXT;
    v_previous_seek_at TIMESTAMPTZ;
    v_previous_seek_version TEXT;
    v_previous_count INT;
    v_previous_skipped INT;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_prefix_len := length(coalesce(prefix, ''));
    v_prefix_start := coalesce(array_length(string_to_array(coalesce(prefix, ''), v_delimiter), 1), 1);
    v_combined_levels := coalesce(array_length(string_to_array(v_prefix, v_delimiter), 1), 1);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);
    v_next_seek_at := NULL;
    v_next_seek_version := '';

    -- COALESCE first: NULL NOT IN (...) evaluates to NULL (not TRUE), so a
    -- bare NOT IN check silently leaves an explicit NULL argument unreset.
    noncurrent_versions := COALESCE(noncurrent_versions, 'exclude');
    delete_markers := COALESCE(delete_markers, 'exclude');
    IF noncurrent_versions NOT IN ('exclude', 'only', 'include') THEN
        noncurrent_versions := 'exclude';
    END IF;
    IF delete_markers NOT IN ('exclude', 'only', 'include') THEN
        delete_markers := 'exclude';
    END IF;

    v_multi_row := noncurrent_versions IN ('only', 'include');

    v_version_filter := '';
    IF noncurrent_versions = 'exclude' THEN
        v_version_filter := v_version_filter || ' AND o.archived_at IS NULL';
    ELSIF noncurrent_versions = 'only' THEN
        v_version_filter := v_version_filter || ' AND o.archived_at IS NOT NULL';
    END IF;
    IF delete_markers = 'exclude' THEN
        v_version_filter := v_version_filter || ' AND NOT o.is_delete_marker';
    ELSIF delete_markers = 'only' THEN
        v_version_filter := v_version_filter || ' AND o.is_delete_marker';
    END IF;

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT array_to_string(path_tokens[$1:$2], '/') AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $3 || '%%'
                  AND bucket_id = $4
                  AND array_length(objects.path_tokens, 1) <> $2
                  AND ($7 != 'exclude' OR objects.archived_at IS NULL)
                  AND ($7 != 'only' OR objects.archived_at IS NOT NULL)
                  AND ($8 != 'exclude' OR NOT objects.is_delete_marker)
                  AND ($8 != 'only' OR objects.is_delete_marker)
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata,
                   NULL::text AS version,
                   NULL::timestamptz AS archived_at,
                   NULL::boolean AS is_delete_marker,
                   NULL::boolean AS is_versioned FROM folders)
            UNION ALL
            (SELECT array_to_string(path_tokens[$1:$2], '/') AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata,
                   version, archived_at, is_delete_marker, is_versioned
             FROM storage.objects
             WHERE objects.name ILIKE $3 || '%%'
               AND bucket_id = $4
               AND array_length(objects.path_tokens, 1) = $2
               AND ($7 != 'exclude' OR objects.archived_at IS NULL)
               AND ($7 != 'only' OR objects.archived_at IS NOT NULL)
               AND ($8 != 'exclude' OR NOT objects.is_delete_marker)
               AND ($8 != 'only' OR objects.is_delete_marker)
             -- name, then version, as tiebreaks so two versions of the same
             -- key tying on the sort column still sort deterministically
             ORDER BY %I %s, name COLLATE "C" %s, COALESCE(version, '') %s)
            LIMIT $5 OFFSET $6
            $sql$, v_sort_order, v_order_by, v_sort_order, v_sort_order, v_sort_order
        ) USING v_prefix_start, v_combined_levels, v_prefix, bucketname, v_limit, offsets, noncurrent_versions, delete_markers;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build a resume-safe batch query. The exact-name branch returns remaining
    -- versions after the current (archived_at, version) boundary; the strict
    -- name branch returns subsequent keys. UNION ALL keeps both predicates
    -- independently indexable.
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT * FROM (' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" = $2 AND ($5::timestamptz IS NULL OR COALESCE(o.archived_at, ''infinity''::timestamptz) < $5 OR (COALESCE(o.archived_at, ''infinity''::timestamptz) = $5 AND COALESCE(o.version, '''') > $6))' ||
                v_version_filter || ' ORDER BY COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4) UNION ALL ' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" > $2 AND lower(o.name) COLLATE "C" < $3' || v_version_filter ||
                ' ORDER BY lower(o.name) COLLATE "C" ASC, COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4)' ||
                ') sub ORDER BY lower(sub.name) COLLATE "C" ASC, COALESCE(sub.archived_at, ''infinity''::timestamptz) DESC, COALESCE(sub.version, '''') ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT * FROM (' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" = $2 AND ($5::timestamptz IS NULL OR COALESCE(o.archived_at, ''infinity''::timestamptz) < $5 OR (COALESCE(o.archived_at, ''infinity''::timestamptz) = $5 AND COALESCE(o.version, '''') > $6))' ||
                v_version_filter || ' ORDER BY COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4) UNION ALL ' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" > $2' || v_version_filter ||
                ' ORDER BY lower(o.name) COLLATE "C" ASC, COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4)' ||
                ') sub ORDER BY lower(sub.name) COLLATE "C" ASC, COALESCE(sub.archived_at, ''infinity''::timestamptz) DESC, COALESCE(sub.version, '''') ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT * FROM (' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" = $2 AND ($5::timestamptz IS NULL OR COALESCE(o.archived_at, ''infinity''::timestamptz) < $5 OR (COALESCE(o.archived_at, ''infinity''::timestamptz) = $5 AND COALESCE(o.version, '''') > $6))' ||
                v_version_filter || ' ORDER BY COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4) UNION ALL ' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 AND lower(o.name) COLLATE "C" >= $3' || v_version_filter ||
                ' ORDER BY lower(o.name) COLLATE "C" DESC, COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4)' ||
                ') sub ORDER BY lower(sub.name) COLLATE "C" DESC, COALESCE(sub.archived_at, ''infinity''::timestamptz) DESC, COALESCE(sub.version, '''') ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT * FROM (' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" = $2 AND ($5::timestamptz IS NULL OR COALESCE(o.archived_at, ''infinity''::timestamptz) < $5 OR (COALESCE(o.archived_at, ''infinity''::timestamptz) = $5 AND COALESCE(o.version, '''') > $6))' ||
                v_version_filter || ' ORDER BY COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4) UNION ALL ' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2' || v_version_filter ||
                ' ORDER BY lower(o.name) COLLATE "C" DESC, COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4)' ||
                ') sub ORDER BY lower(sub.name) COLLATE "C" DESC, COALESCE(sub.archived_at, ''infinity''::timestamptz) DESC, COALESCE(sub.version, '''') ASC LIMIT $4';
        END IF;
    END IF;

    -- Keep the delete-marker predicate literal so the cached generic
    -- plan can use idx_objects_delete_markers during the main-loop peek.
    IF delete_markers = 'only' THEN
        IF v_multi_row THEN
            v_delete_marker_peek_query :=
                'SELECT marker_page.name FROM (' || v_batch_query || ') marker_page LIMIT 1';
        ELSIF v_is_asc THEN
            -- Two separate literal query strings, not one gated by a bound
            -- boolean: folding "$n AND op1 OR NOT $n AND op2" into a single
            -- query defeats the generic plan's ability to push either
            -- comparison into the index. Branching in PL/pgSQL control flow
            -- instead keeps each query's index condition intact.
            v_delete_marker_peek_query :=
                'SELECT o.name FROM storage.objects o WHERE o.bucket_id = $1 ' ||
                'AND lower(o.name) COLLATE "C" >= $2' ||
                CASE WHEN v_upper_bound IS NOT NULL
                    THEN ' AND lower(o.name) COLLATE "C" < $3'
                    ELSE ''
                END ||
                v_version_filter ||
                ' ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1';
            -- Strict variant: used once the single-row ASC batch advance
            -- (below) has left v_next_seek pointing at the last row already
            -- emitted, so a plain >= would re-match it forever.
            v_delete_marker_peek_query_strict :=
                'SELECT o.name FROM storage.objects o WHERE o.bucket_id = $1 ' ||
                'AND lower(o.name) COLLATE "C" > $2' ||
                CASE WHEN v_upper_bound IS NOT NULL
                    THEN ' AND lower(o.name) COLLATE "C" < $3'
                    ELSE ''
                END ||
                v_version_filter ||
                ' ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1';
        ELSE
            v_delete_marker_peek_query :=
                'SELECT o.name FROM storage.objects o WHERE o.bucket_id = $1 ' ||
                'AND lower(o.name) COLLATE "C" < $2' ||
                CASE WHEN v_upper_bound IS NOT NULL
                    THEN ' AND lower(o.name) COLLATE "C" >= $3'
                    ELSE ''
                END ||
                v_version_filter ||
                ' ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC performs one specialized initial seek so partial current-version
        -- and delete-marker indexes remain available.
        EXECUTE format(
            'SELECT o.name FROM storage.objects o WHERE o.bucket_id = $1%s%s ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1',
            CASE WHEN v_upper_bound IS NOT NULL
                THEN ' AND lower(o.name) COLLATE "C" >= $2 AND lower(o.name) COLLATE "C" < $3'
                ELSE ''
            END,
            v_version_filter
        )
        INTO v_peek_name
        USING bucketname, v_prefix_lower, v_upper_bound;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch and
    -- the delete-marker-only path
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        v_previous_seek := v_next_seek;
        v_previous_seek_at := v_next_seek_at;
        v_previous_seek_version := v_next_seek_version;
        v_previous_count := v_count;
        v_previous_skipped := v_skipped;

        -- STEP 1: PEEK
        v_peek_name := NULL;
        IF delete_markers = 'only' THEN
            EXECUTE CASE WHEN v_next_seek_strict
                THEN v_delete_marker_peek_query_strict
                ELSE v_delete_marker_peek_query
            END
                INTO v_peek_name
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END,
                    1, v_next_seek_at, v_next_seek_version;
        ELSIF v_multi_row AND v_next_seek_at IS NOT NULL THEN
            SELECT o.name INTO v_peek_name
            FROM storage.objects o
            WHERE o.bucket_id = bucketname
              AND lower(o.name) COLLATE "C" = v_next_seek
              AND (COALESCE(o.archived_at, 'infinity'::timestamptz) < v_next_seek_at
                   OR (COALESCE(o.archived_at, 'infinity'::timestamptz) = v_next_seek_at
                       AND COALESCE(o.version, '') > v_next_seek_version))
              AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
              AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
              AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
              AND (delete_markers != 'only' OR o.is_delete_marker)
            ORDER BY COALESCE(o.archived_at, 'infinity'::timestamptz) DESC,
                     COALESCE(o.version, '') ASC
            LIMIT 1;

            -- The current key is exhausted. Clear its version boundary and
            -- make the following ASC name peek strict. Appending '/' is not a
            -- valid lexical successor because keys ending in characters such
            -- as '!' sort between the exhausted name and name || '/'.
            IF v_peek_name IS NULL THEN
                IF v_is_asc THEN
                    v_next_seek_strict := true;
                END IF;
                v_next_seek_at := NULL;
                v_next_seek_version := '';
            END IF;
        END IF;

        -- Single-row mode is always noncurrent_versions='exclude'. Keep the
        -- current-row predicate literal so generic plans use the current index.
        IF delete_markers != 'only' AND v_peek_name IS NULL AND NOT v_multi_row THEN
            IF v_is_asc THEN
                IF v_next_seek_strict AND v_upper_bound IS NOT NULL THEN
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" > v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                    ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
                ELSIF v_next_seek_strict THEN
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" > v_next_seek
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                    ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
                ELSIF v_upper_bound IS NOT NULL THEN
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                    ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
                ELSE
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                    ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
                END IF;
            ELSIF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                  AND o.archived_at IS NULL
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                  AND o.archived_at IS NULL
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        ELSIF delete_markers != 'only' AND v_peek_name IS NULL AND v_is_asc THEN
            IF v_next_seek_strict AND v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" > v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                  AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                  AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                  AND (delete_markers != 'only' OR o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSIF v_next_seek_strict THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" > v_next_seek
                  AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                  AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                  AND (delete_markers != 'only' OR o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSIF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                  AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                  AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                  AND (delete_markers != 'only' OR o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                  AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                  AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                  AND (delete_markers != 'only' OR o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSIF delete_markers != 'only' AND v_peek_name IS NULL THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                  AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                  AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                  AND (delete_markers != 'only' OR o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                  AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                  AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                  AND (delete_markers != 'only' OR o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- If the peek landed on a different key than we were tracking, any
        -- version boundary belongs to the OLD key and must not leak into the
        -- new one - e.g. the deleteMarkers='only' peek doesn't know or care
        -- whether it's continuing the same key or jumping to a new one, so
        -- it never clears these itself.
        IF lower(v_peek_name) IS DISTINCT FROM v_next_seek THEN
            v_next_seek_at := NULL;
            v_next_seek_version := '';
        END IF;

        -- The peek is authoritative for the next key to process. This is
        -- especially important after exhausting a multi-version key: the
        -- version boundary has been cleared, so executing the batch against
        -- a stale v_next_seek would replay every version of that old key.
        v_next_seek := lower(v_peek_name);
        v_next_seek_strict := false;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := substring(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter) from v_prefix_len + 1);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                version := NULL;
                archived_at := NULL;
                is_delete_marker := NULL;
                is_versioned := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
            v_next_seek_at := NULL;
            v_next_seek_version := '';
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size,
                    v_next_seek_at, v_next_seek_version
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it. Reset
                    -- strict mode too - it may have been set by an earlier
                    -- row in this same batch (see the single-row ASC advance
                    -- below), and v_next_seek here is the folder-triggering
                    -- row's own name, which the next peek must find inclusively.
                    v_next_seek := CASE
                        WHEN v_is_asc THEN lower(v_current.name)
                        ELSE lower(v_current.name) || v_delimiter
                    END;
                    v_next_seek_at := NULL;
                    v_next_seek_version := '';
                    v_next_seek_strict := false;
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := substring(v_current.name from v_prefix_len + 1);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    version := v_current.version;
                    archived_at := v_current.archived_at;
                    is_delete_marker := v_current.is_delete_marker;
                    is_versioned := v_current.is_versioned;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Multi-row mode must remain on this key until all of its
                -- versions have crossed the internal batch boundary.
                IF v_multi_row THEN
                    v_next_seek := lower(v_current.name);
                    v_next_seek_at := COALESCE(v_current.archived_at, 'infinity'::timestamptz);
                    v_next_seek_version := COALESCE(v_current.version, '');
                ELSIF v_is_asc THEN
                    -- Appending the delimiter as a fake lexical successor would
                    -- skip a real key like `name || '!'` (or any character
                    -- sorting below the delimiter), which sorts between `name`
                    -- and `name || delimiter`. Track the real name and mark the
                    -- next comparison strict instead - same fix as the
                    -- exhausted-key case above.
                    v_next_seek := lower(v_current.name);
                    v_next_seek_strict := true;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;

        IF v_count = v_previous_count
           AND v_skipped = v_previous_skipped
           AND v_next_seek IS NOT DISTINCT FROM v_previous_seek
           AND v_next_seek_at IS NOT DISTINCT FROM v_previous_seek_at
           AND v_next_seek_version IS NOT DISTINCT FROM v_previous_seek_version THEN
            RAISE EXCEPTION 'storage.search made no progress at seek (%, %, %)',
                v_next_seek, v_next_seek_at, v_next_seek_version;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text, noncurrent_versions text, delete_markers text) OWNER TO supabase_storage_admin;

--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text, noncurrent_versions text DEFAULT 'exclude'::text, delete_markers text DEFAULT 'exclude'::text, p_start_after_version text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb, version text, archived_at timestamp with time zone, is_delete_marker boolean, is_versioned boolean)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
    v_prefix_pattern text;
    v_sort_order text;
    v_sort_column text;
    v_version_tiebreak text;
BEGIN
    v_prefix := coalesce(p_prefix, '');
    -- Keep the raw prefix for common-prefix calculations and escape only LIKE metacharacters.
    v_prefix_pattern := replace(v_prefix, chr(92), chr(92) || chr(92));
    v_prefix_pattern := replace(v_prefix_pattern, '%', chr(92) || '%');
    v_prefix_pattern := replace(v_prefix_pattern, '_', chr(92) || '_');

    -- COALESCE first: NULL NOT IN (...) evaluates to NULL (not TRUE), so a
    -- bare NOT IN check silently leaves an explicit NULL argument unreset.
    noncurrent_versions := COALESCE(noncurrent_versions, 'exclude');
    delete_markers := COALESCE(delete_markers, 'exclude');
    IF noncurrent_versions NOT IN ('exclude', 'only', 'include') THEN
        noncurrent_versions := 'exclude';
    END IF;
    IF delete_markers NOT IN ('exclude', 'only', 'include') THEN
        delete_markers := 'exclude';
    END IF;

    -- $9 is only populated in multi-row mode; it's always '' otherwise, so
    -- only use each row's real version as a tiebreak in multi-row mode.
    v_version_tiebreak := CASE WHEN noncurrent_versions IN ('only', 'include') THEN 'COALESCE(version, '''')' ELSE '''''' END;

    -- Defense-in-depth: this function is independently reachable and must
    -- not trust p_sort_order/p_sort_column to already be validated by a
    -- caller. Normalize to the same strict allow-list storage.search_v2
    -- uses before interpolating anything into dynamic SQL below.
    v_sort_order := lower(coalesce(p_sort_order, 'asc'));
    IF v_sort_order NOT IN ('asc', 'desc') THEN
        v_sort_order := 'asc';
    END IF;

    v_sort_column := lower(coalesce(p_sort_column, 'updated_at'));
    IF v_sort_column NOT IN ('updated_at', 'created_at') THEN
        v_sort_column := 'updated_at';
    END IF;

    IF v_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                o.version AS obj_version,
                o.archived_at AS obj_archived_at,
                o.is_delete_marker AS obj_is_delete_marker,
                o.is_versioned AS obj_is_versioned,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $10 || '%%'
              AND ($7 != 'exclude' OR o.archived_at IS NULL)
              AND ($7 != 'only' OR o.archived_at IS NOT NULL)
              AND ($8 != 'exclude' OR NOT o.is_delete_marker)
              AND ($8 != 'only' OR o.is_delete_marker)
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                common_prefix AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                NULL::text AS version,
                NULL::timestamptz AS archived_at,
                NULL::boolean AS is_delete_marker,
                NULL::boolean AS is_versioned,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                obj_version AS version,
                obj_archived_at AS archived_at,
                obj_is_delete_marker AS is_delete_marker,
                obj_is_versioned AS is_versioned,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz),
                    name COLLATE "C",
                    %s
                ) %s ROW(
                    -- truncated the same way as the stored value above
                    date_trunc('milliseconds', COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz)),
                    $5,
                    $9
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata,
            version,
            archived_at,
            is_delete_marker,
            is_versioned
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s,
            COALESCE(version, '') %s
        LIMIT $4
    $sql$,
        v_sort_column,
        v_version_tiebreak,
        v_cursor_op,
        v_sort_column,
        v_sort_order,
        v_sort_order,
        v_sort_order
    );

    -- version is the third tiebreak component for two versions of the same
    -- key tying on both timestamp and name (see filtered CTE / ORDER BY above)
    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after, noncurrent_versions, delete_markers, coalesce(p_start_after_version, ''), v_prefix_pattern;
END;
$_$;


ALTER FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text, noncurrent_versions text, delete_markers text, p_start_after_version text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text, text, text, text, text, text, timestamp with time zone, text, boolean); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text, noncurrent_versions text DEFAULT 'exclude'::text, delete_markers text DEFAULT 'exclude'::text, start_after_archived_at timestamp with time zone DEFAULT NULL::timestamp with time zone, start_after_version text DEFAULT ''::text, start_after_is_continuation boolean DEFAULT false) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb, version text, archived_at timestamp with time zone, is_delete_marker boolean, is_versioned boolean)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata,
            l.version,
            l.archived_at,
            l.is_delete_marker,
            l.is_versioned
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            CASE WHEN start_after_is_continuation THEN '' ELSE start_after END,
            CASE WHEN start_after_is_continuation THEN start_after ELSE '' END,
            v_sort_ord,
            noncurrent_versions,
            delete_markers,
            start_after_archived_at,
            start_after_version
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after,
            noncurrent_versions, delete_markers, start_after_version
        );
    END IF;
END;
$$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text, noncurrent_versions text, delete_markers text, start_after_archived_at timestamp with time zone, start_after_version text, start_after_is_continuation boolean) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    custom_claims_allowlist text[] DEFAULT '{}'::text[] NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


ALTER TABLE auth.custom_oauth_providers OWNER TO supabase_auth_admin;

--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: mfa_recovery_code_sets; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_recovery_code_sets (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    mfa_factor_id uuid NOT NULL,
    failed_verification_count integer DEFAULT 0 NOT NULL,
    verification_locked_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT mfa_recovery_code_sets_failed_verification_count_check CHECK ((failed_verification_count >= 0))
);


ALTER TABLE auth.mfa_recovery_code_sets OWNER TO supabase_auth_admin;

--
-- Name: mfa_recovery_codes; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_recovery_codes (
    id uuid NOT NULL,
    mfa_recovery_code_set_id uuid NOT NULL,
    code_hash text NOT NULL,
    consumed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE auth.mfa_recovery_codes OWNER TO supabase_auth_admin;

--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


ALTER TABLE auth.oauth_authorizations OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE auth.oauth_client_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


ALTER TABLE auth.oauth_consents OWNER TO supabase_auth_admin;

--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: scim_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.scim_tokens (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    token_hash text NOT NULL,
    prefix text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    revoked_at timestamp with time zone,
    last_used_at timestamp with time zone,
    CONSTRAINT scim_tokens_expires_at_future CHECK (((expires_at IS NULL) OR (expires_at > created_at))),
    CONSTRAINT scim_tokens_revoked_after_created CHECK (((revoked_at IS NULL) OR (revoked_at >= created_at))),
    CONSTRAINT scim_tokens_token_hash_check CHECK ((token_hash ~ '^[0-9a-f]{64}$'::text))
);


ALTER TABLE auth.scim_tokens OWNER TO supabase_auth_admin;

--
-- Name: scim_users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.scim_users (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    user_id uuid,
    resource jsonb NOT NULL,
    user_name text GENERATED ALWAYS AS (lower((resource ->> 'userName'::text))) STORED NOT NULL,
    external_id text GENERATED ALWAYS AS ((resource ->> 'externalId'::text)) STORED,
    active boolean GENERATED ALWAYS AS (COALESCE(((resource ->> 'active'::text))::boolean, true)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE auth.scim_users OWNER TO supabase_auth_admin;

--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


ALTER TABLE auth.webauthn_challenges OWNER TO supabase_auth_admin;

--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


ALTER TABLE auth.webauthn_credentials OWNER TO supabase_auth_admin;

--
-- Name: audit_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_id uuid NOT NULL,
    congregation_id uuid,
    action text NOT NULL,
    entity text NOT NULL,
    entity_id uuid NOT NULL,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL,
    before_data jsonb,
    after_data jsonb,
    reason text
);


ALTER TABLE public.audit_events OWNER TO postgres;

--
-- Name: congregation_monthly_entry_categories; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.congregation_monthly_entry_categories WITH (security_invoker='true') AS
 SELECT congregation_id,
    (date_trunc('month'::text, (occurred_on)::timestamp with time zone))::date AS reference_period,
    category,
    (sum(amount_cents))::bigint AS amount_cents
   FROM public.entries
  GROUP BY congregation_id, ((date_trunc('month'::text, (occurred_on)::timestamp with time zone))::date), category;


ALTER VIEW public.congregation_monthly_entry_categories OWNER TO postgres;

--
-- Name: congregation_monthly_summary; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.congregation_monthly_summary WITH (security_invoker='true') AS
 WITH months AS (
         SELECT entries.congregation_id,
            (date_trunc('month'::text, (entries.occurred_on)::timestamp with time zone))::date AS reference_period
           FROM public.entries
        UNION
         SELECT expenses.congregation_id,
            (date_trunc('month'::text, (expenses.occurred_on)::timestamp with time zone))::date AS date_trunc
           FROM public.expenses
        UNION
         SELECT headquarters_transfers.origin_congregation_id,
            (date_trunc('month'::text, (COALESCE(headquarters_transfers.occurred_on, headquarters_transfers.reference_period))::timestamp with time zone))::date AS date_trunc
           FROM public.headquarters_transfers
        UNION
         SELECT financial_adjustments.congregation_id,
            financial_adjustments.reference_period
           FROM public.financial_adjustments
        UNION
         SELECT financial_reversals.congregation_id,
            financial_reversals.reference_period
           FROM public.financial_reversals
        ), entry_totals AS (
         SELECT entries.congregation_id,
            (date_trunc('month'::text, (entries.occurred_on)::timestamp with time zone))::date AS reference_period,
            COALESCE(sum(entries.amount_cents), (0)::numeric) AS entries
           FROM public.entries
          GROUP BY entries.congregation_id, ((date_trunc('month'::text, (entries.occurred_on)::timestamp with time zone))::date)
        ), expense_totals AS (
         SELECT expenses.congregation_id,
            (date_trunc('month'::text, (expenses.occurred_on)::timestamp with time zone))::date AS reference_period,
            COALESCE(sum(expenses.amount_cents), (0)::numeric) AS expenses
           FROM public.expenses
          GROUP BY expenses.congregation_id, ((date_trunc('month'::text, (expenses.occurred_on)::timestamp with time zone))::date)
        ), transfer_totals AS (
         SELECT headquarters_transfers.origin_congregation_id AS congregation_id,
            (date_trunc('month'::text, (COALESCE(headquarters_transfers.occurred_on, headquarters_transfers.reference_period))::timestamp with time zone))::date AS reference_period,
            COALESCE(sum(headquarters_transfers.amount_sent_cents) FILTER (WHERE (headquarters_transfers.status <> 'cancelled'::public.transfer_status)), (0)::numeric) AS transfers
           FROM public.headquarters_transfers
          GROUP BY headquarters_transfers.origin_congregation_id, ((date_trunc('month'::text, (COALESCE(headquarters_transfers.occurred_on, headquarters_transfers.reference_period))::timestamp with time zone))::date)
        ), adjustment_totals AS (
         SELECT financial_adjustments.congregation_id,
            financial_adjustments.reference_period,
            (COALESCE(sum(financial_adjustments.amount_cents), (0)::numeric))::bigint AS adjustments
           FROM public.financial_adjustments
          WHERE (financial_adjustments.status = 'posted'::public.correction_status)
          GROUP BY financial_adjustments.congregation_id, financial_adjustments.reference_period
        ), reversal_totals AS (
         SELECT financial_reversals.congregation_id,
            financial_reversals.reference_period,
            (COALESCE(sum(
                CASE
                    WHEN (financial_reversals.entity_type = 'entries'::text) THEN (- financial_reversals.amount_cents)
                    ELSE financial_reversals.amount_cents
                END), (0)::numeric))::bigint AS reversals
           FROM public.financial_reversals
          WHERE (financial_reversals.status = 'posted'::public.correction_status)
          GROUP BY financial_reversals.congregation_id, financial_reversals.reference_period
        )
 SELECT m.congregation_id,
    m.reference_period,
    COALESCE(c.opening_balance_cents, (0)::bigint) AS opening_balance,
    COALESCE(e.entries, (0)::numeric) AS entries,
    COALESCE(x.expenses, (0)::numeric) AS expenses,
    COALESCE(t.transfers, (0)::numeric) AS transfers,
    (COALESCE(c.adjustments_cents, (0)::bigint) + COALESCE(a.adjustments, (0)::bigint)) AS adjustments,
    (((((((COALESCE(c.opening_balance_cents, (0)::bigint))::numeric + COALESCE(e.entries, (0)::numeric)) - COALESCE(x.expenses, (0)::numeric)) - COALESCE(t.transfers, (0)::numeric)) + (COALESCE(a.adjustments, (0)::bigint))::numeric) + (COALESCE(r.reversals, (0)::bigint))::numeric) + (COALESCE(c.adjustments_cents, (0)::bigint))::numeric) AS closing_balance,
    c.status AS closing_status
   FROM ((((((months m
     LEFT JOIN public.monthly_closings c USING (congregation_id, reference_period))
     LEFT JOIN entry_totals e USING (congregation_id, reference_period))
     LEFT JOIN expense_totals x USING (congregation_id, reference_period))
     LEFT JOIN transfer_totals t USING (congregation_id, reference_period))
     LEFT JOIN adjustment_totals a USING (congregation_id, reference_period))
     LEFT JOIN reversal_totals r USING (congregation_id, reference_period));


ALTER VIEW public.congregation_monthly_summary OWNER TO postgres;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    congregation_id uuid NOT NULL,
    entity_type public.document_entity NOT NULL,
    entity_id uuid NOT NULL,
    storage_path text NOT NULL,
    file_name text NOT NULL,
    content_type text NOT NULL,
    uploaded_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: membership_permission_overrides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.membership_permission_overrides (
    user_id uuid NOT NULL,
    congregation_id uuid NOT NULL,
    financial_read boolean DEFAULT true NOT NULL,
    financial_write boolean DEFAULT false NOT NULL,
    financial_approve boolean DEFAULT false NOT NULL,
    closing_submit boolean DEFAULT false NOT NULL,
    audit_read boolean DEFAULT false NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    hierarchy_view boolean DEFAULT false NOT NULL,
    hierarchy_financial_read boolean DEFAULT false NOT NULL
);


ALTER TABLE public.membership_permission_overrides OWNER TO postgres;

--
-- Name: memberships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.memberships (
    user_id uuid NOT NULL,
    congregation_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.memberships OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT timezone('utc'::text, clock_timestamp()) NOT NULL,
    inserted_at timestamp without time zone DEFAULT timezone('utc'::text, clock_timestamp()) NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone DEFAULT now()
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    selected_columns text[],
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


ALTER TABLE realtime.subscription OWNER TO supabase_realtime_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL,
    versioning_status text DEFAULT 'DISABLED'::text NOT NULL,
    lifecycle_configuration jsonb,
    lifecycle_configuration_generation uuid,
    CONSTRAINT buckets_lifecycle_configuration_pair_check CHECK (((lifecycle_configuration IS NULL) = (lifecycle_configuration_generation IS NULL))),
    CONSTRAINT buckets_lifecycle_configuration_shape_check CHECK (((lifecycle_configuration IS NULL) OR ((jsonb_typeof(lifecycle_configuration) = 'object'::text) AND (lifecycle_configuration ? 'rules'::text) AND
CASE
    WHEN (jsonb_typeof((lifecycle_configuration -> 'rules'::text)) = 'array'::text) THEN ((jsonb_array_length((lifecycle_configuration -> 'rules'::text)) >= 1) AND (jsonb_array_length((lifecycle_configuration -> 'rules'::text)) <= 1000))
    ELSE false
END))),
    CONSTRAINT buckets_lifecycle_configuration_standard_only_check CHECK (((type = 'STANDARD'::storage.buckettype) OR ((lifecycle_configuration IS NULL) AND (lifecycle_configuration_generation IS NULL)))),
    CONSTRAINT buckets_versioning_dark_check CHECK ((versioning_status = 'DISABLED'::text)),
    CONSTRAINT buckets_versioning_standard_only_check CHECK (((type = 'STANDARD'::storage.buckettype) OR (versioning_status = 'DISABLED'::text))),
    CONSTRAINT buckets_versioning_status_check CHECK ((versioning_status = ANY (ARRAY['DISABLED'::text, 'ENABLED'::text, 'SUSPENDED'::text])))
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_vectors OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    archived_at timestamp with time zone,
    is_delete_marker boolean DEFAULT false NOT NULL,
    is_versioned boolean DEFAULT false NOT NULL
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb,
    metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.vector_indexes OWNER TO supabase_storage_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: postgres
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


ALTER TABLE supabase_migrations.schema_migrations OWNER TO postgres;

--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at, custom_claims_allowlist) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
bd051a16-d31a-476d-950a-fb4404b7090a	bd051a16-d31a-476d-950a-fb4404b7090a	{"sub": "bd051a16-d31a-476d-950a-fb4404b7090a", "email": "renanmarianosd@hotmail.com", "email_verified": false, "phone_verified": false}	email	2026-08-30 14:20:06.748362+00	2026-08-30 14:20:06.748434+00	2026-08-30 14:20:06.748434+00	af69a8f9-b1dc-42bd-bdce-ff0078ca1fcf
9b0d1fd7-9c93-4817-8b9f-16fa57436b8e	9b0d1fd7-9c93-4817-8b9f-16fa57436b8e	{"sub": "9b0d1fd7-9c93-4817-8b9f-16fa57436b8e", "email": "demo@ecclesia.com", "email_verified": true}	email	2026-10-03 23:40:06.302115+00	2026-10-03 23:40:06.302115+00	2026-10-03 23:40:06.302115+00	b9c51c60-cda0-435a-809e-c8c0ab862cf7
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
360ed22a-dcb5-4801-98f8-1ddee54e85ff	2026-10-25 23:32:37.290336+00	2026-10-25 23:32:37.290336+00	password	fcf6c0d8-d29a-4024-9d4e-120d8ef8b7fa
a99bf6be-2e7f-4b76-90a2-4e7db2751dbf	2026-10-26 00:01:51.760138+00	2026-10-26 00:01:51.760138+00	password	4551dd02-c13f-47e8-a6f6-6e29502ed5e6
2282448e-f29b-4e2d-99f9-0f1c3d19f995	2026-10-31 16:29:31.10526+00	2026-10-31 16:29:31.10526+00	password	a8152141-c99b-477a-9de3-9a8e95843b24
538600a1-2d20-4208-b677-807e8135b4db	2026-10-31 16:42:49.29041+00	2026-10-31 16:42:49.29041+00	password	218a7ae4-663f-4f66-83d9-90637e072377
a1381207-40cf-4307-a515-35d066c99a42	2026-10-31 16:55:00.0283+00	2026-10-31 16:55:00.0283+00	password	58532f54-1cb7-422a-bddf-7740b3ef99e7
5da0e28e-98ef-40ba-9cab-dec1a632dfcf	2026-10-31 19:36:55.463151+00	2026-10-31 19:36:55.463151+00	password	f24cb5ce-e561-439c-97c4-5d9570f26515
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: mfa_recovery_code_sets; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_recovery_code_sets (id, user_id, mfa_factor_id, failed_verification_count, verification_locked_until, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_recovery_codes; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_recovery_codes (id, mfa_recovery_code_set_id, code_hash, consumed_at, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at, expires_at) FROM stdin;
b49d61db-9365-4e63-ae2b-8edacc63bec5	9b0d1fd7-9c93-4817-8b9f-16fa57436b8e	recovery_token	1e1512e59479fcc61f0f024b927f760980a6b0cde747cf8c83b92ed0	demo@ecclesia.com	2026-10-25 15:56:33.05631	2026-10-25 15:56:33.05631	\N
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	116	h6rgienywd7f	bd051a16-d31a-476d-950a-fb4404b7090a	f	2026-10-25 23:32:37.248342+00	2026-10-25 23:32:37.248342+00	\N	360ed22a-dcb5-4801-98f8-1ddee54e85ff
00000000-0000-0000-0000-000000000000	117	syljbdqfzrqn	bd051a16-d31a-476d-950a-fb4404b7090a	t	2026-10-26 00:01:51.740204+00	2026-10-26 12:15:48.603905+00	\N	a99bf6be-2e7f-4b76-90a2-4e7db2751dbf
00000000-0000-0000-0000-000000000000	118	swywj3u5cxkf	bd051a16-d31a-476d-950a-fb4404b7090a	t	2026-10-26 12:15:48.626608+00	2026-10-27 00:24:22.689394+00	syljbdqfzrqn	a99bf6be-2e7f-4b76-90a2-4e7db2751dbf
00000000-0000-0000-0000-000000000000	119	zxw2dcguqkda	bd051a16-d31a-476d-950a-fb4404b7090a	t	2026-10-27 00:24:22.70585+00	2026-10-27 02:13:25.845953+00	swywj3u5cxkf	a99bf6be-2e7f-4b76-90a2-4e7db2751dbf
00000000-0000-0000-0000-000000000000	120	63onbqghvgzb	bd051a16-d31a-476d-950a-fb4404b7090a	t	2026-10-27 02:13:25.867249+00	2026-10-28 11:50:13.941129+00	zxw2dcguqkda	a99bf6be-2e7f-4b76-90a2-4e7db2751dbf
00000000-0000-0000-0000-000000000000	121	6mo5dwxtocji	bd051a16-d31a-476d-950a-fb4404b7090a	t	2026-10-28 11:50:13.957491+00	2026-10-28 15:26:50.62637+00	63onbqghvgzb	a99bf6be-2e7f-4b76-90a2-4e7db2751dbf
00000000-0000-0000-0000-000000000000	122	cxneh7l53tsc	bd051a16-d31a-476d-950a-fb4404b7090a	t	2026-10-28 15:26:50.642012+00	2026-10-31 13:25:54.238461+00	6mo5dwxtocji	a99bf6be-2e7f-4b76-90a2-4e7db2751dbf
00000000-0000-0000-0000-000000000000	124	pwsyy4xzxkbo	bd051a16-d31a-476d-950a-fb4404b7090a	f	2026-10-31 16:29:31.068956+00	2026-10-31 16:29:31.068956+00	\N	2282448e-f29b-4e2d-99f9-0f1c3d19f995
00000000-0000-0000-0000-000000000000	125	l7uxq5g2aw54	9b0d1fd7-9c93-4817-8b9f-16fa57436b8e	f	2026-10-31 16:42:49.284158+00	2026-10-31 16:42:49.284158+00	\N	538600a1-2d20-4208-b677-807e8135b4db
00000000-0000-0000-0000-000000000000	126	gxaqppym7cma	9b0d1fd7-9c93-4817-8b9f-16fa57436b8e	f	2026-10-31 16:55:00.022333+00	2026-10-31 16:55:00.022333+00	\N	a1381207-40cf-4307-a515-35d066c99a42
00000000-0000-0000-0000-000000000000	123	cawbhlpi3iik	bd051a16-d31a-476d-950a-fb4404b7090a	t	2026-10-31 13:25:54.26217+00	2026-10-31 16:57:02.249952+00	cxneh7l53tsc	a99bf6be-2e7f-4b76-90a2-4e7db2751dbf
00000000-0000-0000-0000-000000000000	127	4n3g4vaiebqd	bd051a16-d31a-476d-950a-fb4404b7090a	f	2026-10-31 16:57:02.254511+00	2026-10-31 16:57:02.254511+00	cawbhlpi3iik	a99bf6be-2e7f-4b76-90a2-4e7db2751dbf
00000000-0000-0000-0000-000000000000	128	tfpue4qsi53r	9b0d1fd7-9c93-4817-8b9f-16fa57436b8e	f	2026-10-31 19:36:55.424423+00	2026-10-31 19:36:55.424423+00	\N	5da0e28e-98ef-40ba-9cab-dec1a632dfcf
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
20260625000000
20260821000000
20260821010000
20260824000000
20260824000001
20260831180000
\.


--
-- Data for Name: scim_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.scim_tokens (id, sso_provider_id, token_hash, prefix, created_at, expires_at, revoked_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: scim_users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.scim_users (id, sso_provider_id, user_id, resource, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
360ed22a-dcb5-4801-98f8-1ddee54e85ff	bd051a16-d31a-476d-950a-fb4404b7090a	2026-10-25 23:32:37.206753+00	2026-10-25 23:32:37.206753+00	\N	aal1	\N	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 27_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/155.0.8059.37 Mobile/15E148 Safari/604.1	177.58.187.95	\N	\N	\N	\N	\N
2282448e-f29b-4e2d-99f9-0f1c3d19f995	bd051a16-d31a-476d-950a-fb4404b7090a	2026-10-31 16:29:31.022316+00	2026-10-31 16:29:31.022316+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	201.0.61.74	\N	\N	\N	\N	\N
538600a1-2d20-4208-b677-807e8135b4db	9b0d1fd7-9c93-4817-8b9f-16fa57436b8e	2026-10-31 16:42:49.268345+00	2026-10-31 16:42:49.268345+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	179.181.188.200	\N	\N	\N	\N	\N
a1381207-40cf-4307-a515-35d066c99a42	9b0d1fd7-9c93-4817-8b9f-16fa57436b8e	2026-10-31 16:55:00.002014+00	2026-10-31 16:55:00.002014+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Mobile Safari/537.36	177.5.217.177	\N	\N	\N	\N	\N
a99bf6be-2e7f-4b76-90a2-4e7db2751dbf	bd051a16-d31a-476d-950a-fb4404b7090a	2026-10-26 00:01:51.721714+00	2026-10-31 16:57:02.2744+00	\N	aal1	\N	2026-10-31 16:57:02.274282	node	18.228.225.11	\N	\N	\N	\N	\N
5da0e28e-98ef-40ba-9cab-dec1a632dfcf	9b0d1fd7-9c93-4817-8b9f-16fa57436b8e	2026-10-31 19:36:55.382419+00	2026-10-31 19:36:55.382419+00	\N	aal1	\N	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 26_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/156.0.8078.54 Mobile/15E148 Safari/604.1	170.245.26.25	\N	\N	\N	\N	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
\N	44444444-4444-4444-8444-444444444444	authenticated	authenticated	central_admin.fixture@ecclesia.test	test_fixture_password	2026-08-12 23:51:23.443969+00	\N		\N		\N			\N	2026-08-12 23:51:23.443969+00	{"provider": "email"}	{"fixture": "true"}	f	2026-08-12 23:51:23.443969+00	2026-08-12 23:51:23.443969+00	\N	\N			\N		0	\N		\N	f	\N	f
\N	55555555-5555-4555-8555-555555555555	authenticated	authenticated	congregation_admin.fixture@ecclesia.test	test_fixture_password	2026-08-12 23:51:23.443969+00	\N		\N		\N			\N	2026-08-12 23:51:23.443969+00	{"provider": "email"}	{"fixture": "true"}	f	2026-08-12 23:51:23.443969+00	2026-08-12 23:51:23.443969+00	\N	\N			\N		0	\N		\N	f	\N	f
\N	66666666-6666-4666-8666-666666666666	authenticated	authenticated	treasurer.fixture@ecclesia.test	test_fixture_password	2026-08-12 23:51:23.443969+00	\N		\N		\N			\N	2026-08-12 23:51:23.443969+00	{"provider": "email"}	{"fixture": "true"}	f	2026-08-12 23:51:23.443969+00	2026-08-12 23:51:23.443969+00	\N	\N			\N		0	\N		\N	f	\N	f
\N	77777777-7777-4777-8777-777777777777	authenticated	authenticated	auditor.fixture@ecclesia.test	test_fixture_password	2026-08-12 23:51:23.443969+00	\N		\N		\N			\N	2026-08-12 23:51:23.443969+00	{"provider": "email"}	{"fixture": "true"}	f	2026-08-12 23:51:23.443969+00	2026-08-12 23:51:23.443969+00	\N	\N			\N		0	\N		\N	f	\N	f
\N	88888888-8888-4888-8888-888888888888	authenticated	authenticated	viewer.fixture@ecclesia.test	test_fixture_password	2026-08-12 23:51:23.443969+00	\N		\N		\N			\N	2026-08-12 23:51:23.443969+00	{"provider": "email"}	{"fixture": "true"}	f	2026-08-12 23:51:23.443969+00	2026-08-12 23:51:23.443969+00	\N	\N			\N		0	\N		\N	f	\N	f
\N	99999999-9999-4999-8999-999999999999	authenticated	authenticated	b_treasurer.fixture@ecclesia.test	test_fixture_password	2026-08-13 00:03:23.671495+00	\N		\N		\N			\N	2026-08-13 00:03:23.671495+00	{"provider": "email"}	{"fixture": "true"}	f	2026-08-13 00:03:23.671495+00	2026-08-13 00:03:23.671495+00	\N	\N			\N		0	\N		\N	f	\N	f
\N	aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa	authenticated	authenticated	headquarters_admin.fixture@ecclesia.test	test_fixture_password	2026-08-15 15:06:12.495879+00	\N		\N		\N			\N	2026-08-15 15:06:12.495879+00	{"provider": "email"}	{"fixture": "true"}	f	2026-08-15 15:06:12.495879+00	2026-08-15 15:06:12.495879+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	bd051a16-d31a-476d-950a-fb4404b7090a	authenticated	authenticated	renanmarianosd@hotmail.com	$2a$10$cz6i6SkHI0ohG4iwb8tO.utoKgfF5z/o4tE65p6fwnhnJpdbJ9wJC	2026-08-30 14:20:06.760242+00	\N		\N		\N			\N	2026-10-31 16:29:31.021688+00	{"role": "central_admin", "is_dev": true, "provider": "email", "providers": ["email"], "claims_admin": true, "is_super_admin": true}	{"name": "Renan Marques", "role": "central_admin", "is_dev": true, "full_name": "Renan Marques", "email_verified": true, "is_super_admin": true}	\N	2026-08-30 14:20:06.728075+00	2026-10-31 16:57:02.256357+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	9b0d1fd7-9c93-4817-8b9f-16fa57436b8e	authenticated	authenticated	demo@ecclesia.com	$2a$06$AEVKu0jseoNFKseI0c8.se7mjv7ZmUl2BETgG1G6Gd6qNjQCMlnQ.	2026-10-03 23:40:06.302115+00	\N		\N	1e1512e59479fcc61f0f024b927f760980a6b0cde747cf8c83b92ed0	2026-10-25 15:56:31.853402+00			\N	2026-10-31 19:36:55.381237+00	{"provider": "email", "providers": ["email"]}	{"name": "Visitante Demonstração", "role": "viewer", "full_name": "Visitante Demonstração"}	f	2026-10-03 23:40:06.302115+00	2026-10-31 19:36:55.4434+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: audit_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_events (id, actor_id, congregation_id, action, entity, entity_id, occurred_at, before_data, after_data, reason) FROM stdin;
fa967fd0-9b84-40d7-8530-a2406bd20d03	66666666-6666-4666-8666-666666666666	22222222-2222-4222-8222-222222222222	created	entries	15892c8c-3b1f-412d-90e7-273951d57e56	2026-08-13 00:07:49.675311+00	\N	{"id": "15892c8c-3b1f-412d-90e7-273951d57e56", "origin": "fixture", "purpose": "entry validation", "category": "tithe", "created_at": "2026-08-13T00:07:49.675311+00:00", "receipt_id": null, "occurred_on": "2026-08-13", "recorded_by": "66666666-6666-4666-8666-666666666666", "amount_cents": 5000, "payment_method": "pix", "congregation_id": "22222222-2222-4222-8222-222222222222"}	financial_record_created
5a6a6416-6656-4974-919d-1e5e50192b0d	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	created	expenses	d58416be-8d0c-4172-9fba-e34b418b80d1	2026-08-13 00:07:49.675311+00	\N	{"id": "d58416be-8d0c-4172-9fba-e34b418b80d1", "status": "pending", "vendor": "fixture vendor", "purpose": "expense validation", "category": "missions", "created_at": "2026-08-13T00:07:49.675311+00:00", "receipt_id": null, "approved_at": null, "approved_by": null, "cost_center": "general", "description": "fixture expense", "occurred_on": "2026-08-13", "recorded_by": "55555555-5555-4555-8555-555555555555", "amount_cents": 1500, "payment_method": "pix", "congregation_id": "22222222-2222-4222-8222-222222222222"}	financial_record_created
5e6f768a-36f0-41c3-92b9-e8fa2105aa59	66666666-6666-4666-8666-666666666666	22222222-2222-4222-8222-222222222222	created	headquarters_transfers	78fcc951-2c2b-4a20-9638-9637f2eab065	2026-08-13 00:07:49.675311+00	\N	{"id": "78fcc951-2c2b-4a20-9638-9637f2eab065", "reason": "fixture transfer", "status": "requested", "created_at": "2026-08-13T00:07:49.675311+00:00", "receipt_id": null, "approved_by": null, "occurred_on": "2026-08-13", "requested_by": "66666666-6666-4666-8666-666666666666", "destination_name": "Sede", "reference_period": "2026-08-01", "amount_sent_cents": 2000, "amount_received_cents": null, "origin_congregation_id": "22222222-2222-4222-8222-222222222222"}	financial_record_created
6a47c6a0-03c5-47ba-be8a-c1d5bca35969	66666666-6666-4666-8666-666666666666	22222222-2222-4222-8222-222222222222	created	entries	9d9e5ab8-5c9a-455e-a700-4bf1a4b60f68	2026-08-15 15:06:14.349101+00	\N	{"id": "9d9e5ab8-5c9a-455e-a700-4bf1a4b60f68", "origin": "fixture", "purpose": "entry validation", "category": "tithe", "created_at": "2026-08-15T15:06:14.349101+00:00", "receipt_id": null, "occurred_on": "2026-08-15", "recorded_by": "66666666-6666-4666-8666-666666666666", "amount_cents": 5000, "payment_method": "pix", "congregation_id": "22222222-2222-4222-8222-222222222222"}	financial_record_created
ec21c905-f955-4501-b155-b4d34e0bf6d6	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	created	expenses	f500ba57-cc1a-4b1d-af71-2b3558bce699	2026-08-15 15:06:14.349101+00	\N	{"id": "f500ba57-cc1a-4b1d-af71-2b3558bce699", "status": "pending", "vendor": "fixture vendor", "purpose": "expense validation", "category": "missions", "created_at": "2026-08-15T15:06:14.349101+00:00", "receipt_id": null, "approved_at": null, "approved_by": null, "cost_center": "general", "description": "fixture expense", "occurred_on": "2026-08-15", "recorded_by": "55555555-5555-4555-8555-555555555555", "amount_cents": 1500, "payment_method": "pix", "congregation_id": "22222222-2222-4222-8222-222222222222"}	financial_record_created
72ce4571-3860-43c6-9004-533af83106aa	66666666-6666-4666-8666-666666666666	22222222-2222-4222-8222-222222222222	created	headquarters_transfers	933ba47b-d9f7-4ad5-a4d9-200f12ae97fc	2026-08-15 15:06:14.349101+00	\N	{"id": "933ba47b-d9f7-4ad5-a4d9-200f12ae97fc", "reason": "fixture transfer", "status": "requested", "created_at": "2026-08-15T15:06:14.349101+00:00", "receipt_id": null, "approved_by": null, "occurred_on": "2026-08-15", "requested_by": "66666666-6666-4666-8666-666666666666", "destination_name": "Sede", "reference_period": "2026-08-01", "amount_sent_cents": 2000, "amount_received_cents": null, "origin_congregation_id": "22222222-2222-4222-8222-222222222222"}	financial_record_created
bb72caa3-becd-47c4-8f41-b2de638e2a2b	66666666-6666-4666-8666-666666666666	22222222-2222-4222-8222-222222222222	created	entries	cf310dcd-aec3-435a-a4e2-9cbd0446db04	2026-08-15 15:08:21.147813+00	\N	{"id": "cf310dcd-aec3-435a-a4e2-9cbd0446db04", "origin": "fixture", "purpose": "entry validation", "category": "tithe", "created_at": "2026-08-15T15:08:21.147813+00:00", "receipt_id": null, "occurred_on": "2026-08-15", "recorded_by": "66666666-6666-4666-8666-666666666666", "amount_cents": 5000, "payment_method": "pix", "congregation_id": "22222222-2222-4222-8222-222222222222"}	financial_record_created
c2e08c66-423b-4401-808f-3ef245a46b9c	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	created	expenses	ad159a95-feef-424e-806e-1edf8f1bf599	2026-08-15 15:08:21.147813+00	\N	{"id": "ad159a95-feef-424e-806e-1edf8f1bf599", "status": "pending", "vendor": "fixture vendor", "purpose": "expense validation", "category": "missions", "created_at": "2026-08-15T15:08:21.147813+00:00", "receipt_id": null, "approved_at": null, "approved_by": null, "cost_center": "general", "description": "fixture expense", "occurred_on": "2026-08-15", "recorded_by": "55555555-5555-4555-8555-555555555555", "amount_cents": 1500, "payment_method": "pix", "congregation_id": "22222222-2222-4222-8222-222222222222"}	financial_record_created
47f7fe63-c6e1-4abb-ab33-76c257982780	66666666-6666-4666-8666-666666666666	22222222-2222-4222-8222-222222222222	created	headquarters_transfers	75c68176-bf47-4540-9502-082795956d0a	2026-08-15 15:08:21.147813+00	\N	{"id": "75c68176-bf47-4540-9502-082795956d0a", "reason": "fixture transfer", "status": "requested", "created_at": "2026-08-15T15:08:21.147813+00:00", "receipt_id": null, "approved_by": null, "occurred_on": "2026-08-15", "requested_by": "66666666-6666-4666-8666-666666666666", "destination_name": "Sede", "reference_period": "2026-08-01", "amount_sent_cents": 2000, "amount_received_cents": null, "origin_congregation_id": "22222222-2222-4222-8222-222222222222"}	financial_record_created
5527f0f9-ec00-4995-b519-82f8b6a6d4e6	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	created	expenses	fed4c9c1-8483-48e2-8215-5427c63f14aa	2026-08-30 13:38:59.909666+00	\N	{"id": "fed4c9c1-8483-48e2-8215-5427c63f14aa", "status": "pending", "vendor": "fixture vendor", "purpose": "expense validation", "category": "missions", "created_at": "2026-08-30T13:38:59.909666+00:00", "receipt_id": null, "approved_at": null, "approved_by": null, "cost_center": "general", "description": "fixture expense", "occurred_on": "2026-08-30", "recorded_by": "55555555-5555-4555-8555-555555555555", "amount_cents": 1500, "payment_method": "pix", "congregation_id": "22222222-2222-4222-8222-222222222222"}	financial_record_created
88c34551-cd55-4d17-b0ff-5f6a78edc3fe	66666666-6666-4666-8666-666666666666	22222222-2222-4222-8222-222222222222	created	headquarters_transfers	725542b9-40eb-403d-8fd1-1d6550f24b45	2026-08-30 13:38:59.909666+00	\N	{"id": "725542b9-40eb-403d-8fd1-1d6550f24b45", "reason": "fixture transfer", "status": "requested", "created_at": "2026-08-30T13:38:59.909666+00:00", "receipt_id": null, "approved_by": null, "occurred_on": "2026-08-30", "requested_by": "66666666-6666-4666-8666-666666666666", "destination_name": "Sede", "reference_period": "2026-08-01", "amount_sent_cents": 2000, "amount_received_cents": null, "origin_congregation_id": "22222222-2222-4222-8222-222222222222"}	financial_record_created
14243067-3264-4d8b-865b-559676a06ec9	66666666-6666-4666-8666-666666666666	22222222-2222-4222-8222-222222222222	created	entries	51863888-f680-49af-a94a-3779fb343fa5	2026-08-30 13:41:34.564735+00	\N	{"id": "51863888-f680-49af-a94a-3779fb343fa5", "origin": "fixture", "purpose": "entry validation", "category": "tithe", "created_at": "2026-08-30T13:41:34.564735+00:00", "receipt_id": null, "occurred_on": "2026-08-30", "recorded_by": "66666666-6666-4666-8666-666666666666", "amount_cents": 5000, "payment_method": "pix", "congregation_id": "22222222-2222-4222-8222-222222222222"}	financial_record_created
c0717311-1168-4de8-997c-8479acbcb8e5	66666666-6666-4666-8666-666666666666	22222222-2222-4222-8222-222222222222	created	entries	e8887134-c249-4ff8-a1aa-49961547410c	2026-08-30 13:38:59.909666+00	\N	{"id": "e8887134-c249-4ff8-a1aa-49961547410c", "origin": "fixture", "purpose": "entry validation", "category": "tithe", "created_at": "2026-08-30T13:38:59.909666+00:00", "receipt_id": null, "occurred_on": "2026-08-30", "recorded_by": "66666666-6666-4666-8666-666666666666", "amount_cents": 5000, "payment_method": "pix", "congregation_id": "22222222-2222-4222-8222-222222222222"}	financial_record_created
ad9cb50b-b84b-4d7b-b45d-c761200dc845	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	created	expenses	7ff43511-df8d-4431-9016-472a1edf4f1f	2026-08-30 13:41:34.564735+00	\N	{"id": "7ff43511-df8d-4431-9016-472a1edf4f1f", "status": "pending", "vendor": "fixture vendor", "purpose": "expense validation", "category": "missions", "created_at": "2026-08-30T13:41:34.564735+00:00", "receipt_id": null, "approved_at": null, "approved_by": null, "cost_center": "general", "description": "fixture expense", "occurred_on": "2026-08-30", "recorded_by": "55555555-5555-4555-8555-555555555555", "amount_cents": 1500, "payment_method": "pix", "congregation_id": "22222222-2222-4222-8222-222222222222"}	financial_record_created
0e2a3165-42d4-4095-8e1a-85676aa61e49	66666666-6666-4666-8666-666666666666	22222222-2222-4222-8222-222222222222	created	headquarters_transfers	e827e66e-3c80-4c4b-ab01-3991f7003e22	2026-08-30 13:41:34.564735+00	\N	{"id": "e827e66e-3c80-4c4b-ab01-3991f7003e22", "reason": "fixture transfer", "status": "requested", "created_at": "2026-08-30T13:41:34.564735+00:00", "receipt_id": null, "approved_by": null, "occurred_on": "2026-08-30", "requested_by": "66666666-6666-4666-8666-666666666666", "destination_name": "Sede", "reference_period": "2026-08-01", "amount_sent_cents": 2000, "amount_received_cents": null, "origin_congregation_id": "22222222-2222-4222-8222-222222222222"}	financial_record_created
82264da7-c489-4ca7-83af-a01bfd1debc8	66666666-6666-4666-8666-666666666666	22222222-2222-4222-8222-222222222222	created	entries	39f1e518-fc7c-4a38-bf25-46bf42020c10	2026-08-30 13:45:46.264065+00	\N	{"id": "39f1e518-fc7c-4a38-bf25-46bf42020c10", "origin": "fixture", "purpose": "entry validation", "category": "tithe", "created_at": "2026-08-30T13:45:46.264065+00:00", "receipt_id": null, "occurred_on": "2026-08-30", "recorded_by": "66666666-6666-4666-8666-666666666666", "amount_cents": 5000, "payment_method": "pix", "congregation_id": "22222222-2222-4222-8222-222222222222"}	financial_record_created
8fea1338-d8af-428c-b39b-bd3505b1b34a	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	created	expenses	5ddaa9e6-4e9f-41e8-bd73-3b3db67a3b0a	2026-08-30 13:45:46.264065+00	\N	{"id": "5ddaa9e6-4e9f-41e8-bd73-3b3db67a3b0a", "status": "pending", "vendor": "fixture vendor", "purpose": "expense validation", "category": "missions", "created_at": "2026-08-30T13:45:46.264065+00:00", "receipt_id": null, "approved_at": null, "approved_by": null, "cost_center": "general", "description": "fixture expense", "occurred_on": "2026-08-30", "recorded_by": "55555555-5555-4555-8555-555555555555", "amount_cents": 1500, "payment_method": "pix", "congregation_id": "22222222-2222-4222-8222-222222222222"}	financial_record_created
5e126cc3-4d33-4a26-9ffd-8db22e3547b3	66666666-6666-4666-8666-666666666666	22222222-2222-4222-8222-222222222222	created	headquarters_transfers	03593171-ca20-4824-add2-88689c6fdaaa	2026-08-30 13:45:46.264065+00	\N	{"id": "03593171-ca20-4824-add2-88689c6fdaaa", "reason": "fixture transfer", "status": "requested", "created_at": "2026-08-30T13:45:46.264065+00:00", "receipt_id": null, "approved_by": null, "occurred_on": "2026-08-30", "requested_by": "66666666-6666-4666-8666-666666666666", "destination_name": "Sede", "reference_period": "2026-08-01", "amount_sent_cents": 2000, "amount_received_cents": null, "origin_congregation_id": "22222222-2222-4222-8222-222222222222"}	financial_record_created
8ad23de5-90f5-4824-8ddc-920f4a919faa	44444444-4444-4444-8444-444444444444	11111111-1111-4111-8111-111111111111	closed	monthly_closings	e16e57ef-9fd6-45d1-bfef-483ea3bd184a	2026-08-30 13:45:47.228092+00	\N	{"id": "e16e57ef-9fd6-45d1-bfef-483ea3bd184a", "status": "closed", "closed_at": "2026-08-30T13:45:47.228092+00:00", "approved_by": "44444444-4444-4444-8444-444444444444", "submitted_by": "44444444-4444-4444-8444-444444444444", "congregation_id": "11111111-1111-4111-8111-111111111111", "reference_period": "2026-08-01", "adjustments_cents": 0, "opening_balance_cents": 0}	monthly_period_closed
3a8ca07e-7c6d-4a4e-b89a-b2a26a3eae73	aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa	11111111-1111-4111-8111-111111111111	requested	period_reopening_requests	0b51b0a1-88e7-4192-bf41-fecd0864b42a	2026-08-30 13:45:47.228092+00	\N	{"id": "0b51b0a1-88e7-4192-bf41-fecd0864b42a", "reason": "Correção da prestação de contas da Sede", "status": "pending", "approved_at": null, "approved_by": null, "requested_at": "2026-08-30T13:45:47.228092+00:00", "requested_by": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "congregation_id": "11111111-1111-4111-8111-111111111111", "reference_period": "2026-08-01"}	Correção da prestação de contas da Sede
60930b15-ae4e-4692-af89-c5ae77a95f72	44444444-4444-4444-8444-444444444444	11111111-1111-4111-8111-111111111111	approved	period_reopening_requests	0b51b0a1-88e7-4192-bf41-fecd0864b42a	2026-08-30 13:45:47.228092+00	{"closing": {"id": "e16e57ef-9fd6-45d1-bfef-483ea3bd184a", "status": "closed", "closed_at": "2026-08-30T13:45:47.228092+00:00", "approved_by": "44444444-4444-4444-8444-444444444444", "submitted_by": "44444444-4444-4444-8444-444444444444", "congregation_id": "11111111-1111-4111-8111-111111111111", "reference_period": "2026-08-01", "adjustments_cents": 0, "opening_balance_cents": 0}, "request": {"id": "0b51b0a1-88e7-4192-bf41-fecd0864b42a", "reason": "Correção da prestação de contas da Sede", "status": "pending", "approved_at": null, "approved_by": null, "requested_at": "2026-08-30T13:45:47.228092+00:00", "requested_by": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "congregation_id": "11111111-1111-4111-8111-111111111111", "reference_period": "2026-08-01"}}	{"closing": {"id": "e16e57ef-9fd6-45d1-bfef-483ea3bd184a", "status": "open", "closed_at": null, "approved_by": "44444444-4444-4444-8444-444444444444", "submitted_by": "44444444-4444-4444-8444-444444444444", "congregation_id": "11111111-1111-4111-8111-111111111111", "reference_period": "2026-08-01", "adjustments_cents": 0, "opening_balance_cents": 0}, "request": {"id": "0b51b0a1-88e7-4192-bf41-fecd0864b42a", "reason": "Correção da prestação de contas da Sede", "status": "approved", "approved_at": "2026-08-30T13:45:47.228092+00:00", "approved_by": "44444444-4444-4444-8444-444444444444", "requested_at": "2026-08-30T13:45:47.228092+00:00", "requested_by": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "congregation_id": "11111111-1111-4111-8111-111111111111", "reference_period": "2026-08-01"}}	Correção da prestação de contas da Sede
cbdf6641-5f59-4895-93ee-873bbd942fc2	66666666-6666-4666-8666-666666666666	22222222-2222-4222-8222-222222222222	created	entries	e548cd31-f3fe-4d97-b00a-196ed7cc5647	2026-08-30 13:45:47.228092+00	\N	{"id": "e548cd31-f3fe-4d97-b00a-196ed7cc5647", "origin": "cash", "purpose": "adjustment fixture", "category": "tithe", "created_at": "2026-08-30T13:45:47.228092+00:00", "receipt_id": null, "occurred_on": "2026-08-30", "recorded_by": "66666666-6666-4666-8666-666666666666", "amount_cents": 50000, "payment_method": "cash", "congregation_id": "22222222-2222-4222-8222-222222222222"}	financial_record_created
8a046f01-7878-4594-a70a-e4968dfc4532	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	posted	financial_adjustments	9a864139-2f0a-43cb-82bb-5717e186e61e	2026-08-30 13:45:47.228092+00	\N	{"id": "9a864139-2f0a-43cb-82bb-5717e186e61e", "reason": "Correção de valor registrado", "status": "posted", "entity_id": "e548cd31-f3fe-4d97-b00a-196ed7cc5647", "created_at": "2026-08-30T13:45:47.228092+00:00", "created_by": "55555555-5555-4555-8555-555555555555", "entity_type": "entries", "amount_cents": 5000, "congregation_id": "22222222-2222-4222-8222-222222222222", "idempotency_key": "10000000-0000-4000-8000-000000000001", "reference_period": "2026-08-01"}	Correção de valor registrado
c5809dbd-5da7-40c8-991c-86dd7d234904	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	posted	financial_adjustments	7a4cf5d1-ec3f-481e-a21c-367f31f1dec8	2026-08-30 13:45:47.228092+00	\N	{"id": "7a4cf5d1-ec3f-481e-a21c-367f31f1dec8", "reason": "Correção negativa de valor registrado", "status": "posted", "entity_id": "e548cd31-f3fe-4d97-b00a-196ed7cc5647", "created_at": "2026-08-30T13:45:47.228092+00:00", "created_by": "55555555-5555-4555-8555-555555555555", "entity_type": "entries", "amount_cents": -5000, "congregation_id": "22222222-2222-4222-8222-222222222222", "idempotency_key": "10000000-0000-4000-8000-000000000002", "reference_period": "2026-08-01"}	Correção negativa de valor registrado
70a7f1b9-d882-4558-b529-1e07cca67a1c	66666666-6666-4666-8666-666666666666	22222222-2222-4222-8222-222222222222	created	expenses	743b86a1-ada8-4d5b-a07f-1dc0fa81dc4c	2026-08-30 13:45:47.228092+00	\N	{"id": "743b86a1-ada8-4d5b-a07f-1dc0fa81dc4c", "status": "pending", "vendor": "fixture", "purpose": "reversal", "category": "supplies", "created_at": "2026-08-30T13:45:47.228092+00:00", "receipt_id": null, "approved_at": null, "approved_by": null, "cost_center": "general", "description": "reversal fixture", "occurred_on": "2026-08-30", "recorded_by": "66666666-6666-4666-8666-666666666666", "amount_cents": 30000, "payment_method": "cash", "congregation_id": "22222222-2222-4222-8222-222222222222"}	financial_record_created
bbc96ee9-4276-4a26-ada0-60e03f201fab	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	approved	expenses	743b86a1-ada8-4d5b-a07f-1dc0fa81dc4c	2026-08-30 13:45:47.228092+00	{"id": "743b86a1-ada8-4d5b-a07f-1dc0fa81dc4c", "status": "pending", "vendor": "fixture", "purpose": "reversal", "category": "supplies", "created_at": "2026-08-30T13:45:47.228092+00:00", "receipt_id": null, "approved_at": null, "approved_by": null, "cost_center": "general", "description": "reversal fixture", "occurred_on": "2026-08-30", "recorded_by": "66666666-6666-4666-8666-666666666666", "amount_cents": 30000, "payment_method": "cash", "congregation_id": "22222222-2222-4222-8222-222222222222"}	{"id": "743b86a1-ada8-4d5b-a07f-1dc0fa81dc4c", "status": "approved", "vendor": "fixture", "purpose": "reversal", "category": "supplies", "created_at": "2026-08-30T13:45:47.228092+00:00", "receipt_id": null, "approved_at": "2026-08-30T13:45:47.228092+00:00", "approved_by": "55555555-5555-4555-8555-555555555555", "cost_center": "general", "description": "reversal fixture", "occurred_on": "2026-08-30", "recorded_by": "66666666-6666-4666-8666-666666666666", "amount_cents": 30000, "payment_method": "cash", "congregation_id": "22222222-2222-4222-8222-222222222222"}	expense_approval
c0f7dfe9-c1eb-4a9c-b007-93c154068632	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	posted	financial_reversals	03d76cf6-2b54-4dcb-ac39-8af5d5f60912	2026-08-30 13:45:47.228092+00	\N	{"id": "03d76cf6-2b54-4dcb-ac39-8af5d5f60912", "reason": "Pagamento cancelado", "status": "posted", "entity_id": "743b86a1-ada8-4d5b-a07f-1dc0fa81dc4c", "created_at": "2026-08-30T13:45:47.228092+00:00", "created_by": "55555555-5555-4555-8555-555555555555", "entity_type": "expenses", "amount_cents": 30000, "congregation_id": "22222222-2222-4222-8222-222222222222", "idempotency_key": "20000000-0000-4000-8000-000000000001", "reference_period": "2026-08-01"}	Pagamento cancelado
fe113e61-74db-4c94-a7d5-fd35b4bf3c8a	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	created	physical_cash_registers	1506721f-f566-4286-b74c-3b2bfd0d1db9	2026-08-30 13:45:47.228092+00	\N	{"id": "1506721f-f566-4286-b74c-3b2bfd0d1db9", "name": "Caixa de saldo 1788097548", "active": true, "created_at": "2026-08-30T13:45:47.228092+00:00", "created_by": "55555555-5555-4555-8555-555555555555", "congregation_id": "22222222-2222-4222-8222-222222222222"}	cash_register_created
f85c6506-f549-4b20-af6b-4b438c46124b	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	opened	physical_cash_periods	32039a17-c10b-4899-b430-cbecf893804f	2026-08-30 13:45:47.228092+00	\N	{"id": "32039a17-c10b-4899-b430-cbecf893804f", "status": "open", "closed_at": null, "closed_by": null, "counted_at": null, "counted_by": null, "created_at": "2026-08-30T13:45:47.228092+00:00", "created_by": "55555555-5555-4555-8555-555555555555", "cash_register_id": "1506721f-f566-4286-b74c-3b2bfd0d1db9", "reference_period": "2026-08-01", "divergence_reason": null, "counted_balance_cents": null, "opening_balance_cents": 50000}	cash_period_opened
784fd8c2-85ab-4884-be5a-ba31022ad8ce	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	created	physical_cash_movements	b9b20beb-b71d-4674-b43d-ff9e877cb668	2026-08-30 13:45:47.228092+00	\N	{"id": "b9b20beb-b71d-4674-b43d-ff9e877cb668", "reason": "Despesa dentro do saldo", "created_at": "2026-08-30T13:45:47.228092+00:00", "created_by": "55555555-5555-4555-8555-555555555555", "amount_cents": 30000, "movement_type": "cash_expense", "cash_period_id": "32039a17-c10b-4899-b430-cbecf893804f", "idempotency_key": "30000000-0000-4000-8000-000000000004", "source_entity_id": null, "source_entity_type": null}	Despesa dentro do saldo
90e7716b-8643-40e3-8993-b77d5eae1fd7	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	counted	physical_cash_periods	32039a17-c10b-4899-b430-cbecf893804f	2026-08-30 13:45:47.228092+00	{"id": "32039a17-c10b-4899-b430-cbecf893804f", "status": "open", "closed_at": null, "closed_by": null, "counted_at": null, "counted_by": null, "created_at": "2026-08-30T13:45:47.228092+00:00", "created_by": "55555555-5555-4555-8555-555555555555", "cash_register_id": "1506721f-f566-4286-b74c-3b2bfd0d1db9", "reference_period": "2026-08-01", "divergence_reason": null, "counted_balance_cents": null, "opening_balance_cents": 50000}	{"id": "32039a17-c10b-4899-b430-cbecf893804f", "status": "open", "closed_at": null, "closed_by": null, "counted_at": "2026-08-30T13:45:47.228092+00:00", "counted_by": "55555555-5555-4555-8555-555555555555", "created_at": "2026-08-30T13:45:47.228092+00:00", "created_by": "55555555-5555-4555-8555-555555555555", "cash_register_id": "1506721f-f566-4286-b74c-3b2bfd0d1db9", "reference_period": "2026-08-01", "divergence_reason": null, "counted_balance_cents": 20000, "opening_balance_cents": 50000}	cash_counted
9eefbf20-0c54-4f37-908c-5095916aadd9	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	closed	physical_cash_periods	32039a17-c10b-4899-b430-cbecf893804f	2026-08-30 13:45:47.228092+00	{"id": "32039a17-c10b-4899-b430-cbecf893804f", "status": "open", "closed_at": null, "closed_by": null, "counted_at": "2026-08-30T13:45:47.228092+00:00", "counted_by": "55555555-5555-4555-8555-555555555555", "created_at": "2026-08-30T13:45:47.228092+00:00", "created_by": "55555555-5555-4555-8555-555555555555", "cash_register_id": "1506721f-f566-4286-b74c-3b2bfd0d1db9", "reference_period": "2026-08-01", "divergence_reason": null, "counted_balance_cents": 20000, "opening_balance_cents": 50000}	{"id": "32039a17-c10b-4899-b430-cbecf893804f", "status": "closed", "closed_at": "2026-08-30T13:45:47.228092+00:00", "closed_by": "55555555-5555-4555-8555-555555555555", "counted_at": "2026-08-30T13:45:47.228092+00:00", "counted_by": "55555555-5555-4555-8555-555555555555", "created_at": "2026-08-30T13:45:47.228092+00:00", "created_by": "55555555-5555-4555-8555-555555555555", "cash_register_id": "1506721f-f566-4286-b74c-3b2bfd0d1db9", "reference_period": "2026-08-01", "divergence_reason": null, "counted_balance_cents": 20000, "opening_balance_cents": 50000}	cash_period_closed
53e39bc4-7f40-47fc-8525-431cccf0ed9e	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	created	physical_cash_registers	2cc158bc-9c98-4d26-9ca6-f655fa4c9e8b	2026-08-30 13:45:47.228092+00	\N	{"id": "2cc158bc-9c98-4d26-9ca6-f655fa4c9e8b", "name": "Caixa de conferência 1788097548", "active": true, "created_at": "2026-08-30T13:45:47.228092+00:00", "created_by": "55555555-5555-4555-8555-555555555555", "congregation_id": "22222222-2222-4222-8222-222222222222"}	cash_register_created
4457e29a-5daf-4db0-9c1a-b7975773f358	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	opened	physical_cash_periods	9182c323-0cd9-4ba2-baf1-ef24a4f020cd	2026-08-30 13:45:47.228092+00	\N	{"id": "9182c323-0cd9-4ba2-baf1-ef24a4f020cd", "status": "open", "closed_at": null, "closed_by": null, "counted_at": null, "counted_by": null, "created_at": "2026-08-30T13:45:47.228092+00:00", "created_by": "55555555-5555-4555-8555-555555555555", "cash_register_id": "2cc158bc-9c98-4d26-9ca6-f655fa4c9e8b", "reference_period": "2026-08-01", "divergence_reason": null, "counted_balance_cents": null, "opening_balance_cents": 50000}	cash_period_opened
fa23f2ac-7e90-4b83-8abd-0ebab8414bae	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	created	physical_cash_movements	59936992-7258-45fa-95fa-b2929bde4045	2026-08-30 13:45:47.228092+00	\N	{"id": "59936992-7258-45fa-95fa-b2929bde4045", "reason": "Entrada em espécie", "created_at": "2026-08-30T13:45:47.228092+00:00", "created_by": "55555555-5555-4555-8555-555555555555", "amount_cents": 100000, "movement_type": "cash_in", "cash_period_id": "9182c323-0cd9-4ba2-baf1-ef24a4f020cd", "idempotency_key": "30000000-0000-4000-8000-000000000001", "source_entity_id": null, "source_entity_type": null}	Entrada em espécie
3c781d13-7cb1-42dd-8a6f-b5107d9c96ad	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	created	physical_cash_movements	c09a9415-c797-46fa-9315-7e676f15235b	2026-08-30 13:45:47.228092+00	\N	{"id": "c09a9415-c797-46fa-9315-7e676f15235b", "reason": "Despesa em espécie", "created_at": "2026-08-30T13:45:47.228092+00:00", "created_by": "55555555-5555-4555-8555-555555555555", "amount_cents": 30000, "movement_type": "cash_expense", "cash_period_id": "9182c323-0cd9-4ba2-baf1-ef24a4f020cd", "idempotency_key": "30000000-0000-4000-8000-000000000002", "source_entity_id": null, "source_entity_type": null}	Despesa em espécie
b0d29af4-808e-4400-b01a-55b65f81131f	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	created	physical_cash_movements	38a842a1-6f27-42b0-bd3f-2399dd3a014f	2026-08-30 13:45:47.228092+00	\N	{"id": "38a842a1-6f27-42b0-bd3f-2399dd3a014f", "reason": "Depósito bancário", "created_at": "2026-08-30T13:45:47.228092+00:00", "created_by": "55555555-5555-4555-8555-555555555555", "amount_cents": 80000, "movement_type": "deposit", "cash_period_id": "9182c323-0cd9-4ba2-baf1-ef24a4f020cd", "idempotency_key": "30000000-0000-4000-8000-000000000003", "source_entity_id": null, "source_entity_type": null}	Depósito bancário
181621c8-191a-41ff-acb3-93913f79bf03	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	counted	physical_cash_periods	9182c323-0cd9-4ba2-baf1-ef24a4f020cd	2026-08-30 13:45:47.228092+00	{"id": "9182c323-0cd9-4ba2-baf1-ef24a4f020cd", "status": "open", "closed_at": null, "closed_by": null, "counted_at": null, "counted_by": null, "created_at": "2026-08-30T13:45:47.228092+00:00", "created_by": "55555555-5555-4555-8555-555555555555", "cash_register_id": "2cc158bc-9c98-4d26-9ca6-f655fa4c9e8b", "reference_period": "2026-08-01", "divergence_reason": null, "counted_balance_cents": null, "opening_balance_cents": 50000}	{"id": "9182c323-0cd9-4ba2-baf1-ef24a4f020cd", "status": "open", "closed_at": null, "closed_by": null, "counted_at": "2026-08-30T13:45:47.228092+00:00", "counted_by": "55555555-5555-4555-8555-555555555555", "created_at": "2026-08-30T13:45:47.228092+00:00", "created_by": "55555555-5555-4555-8555-555555555555", "cash_register_id": "2cc158bc-9c98-4d26-9ca6-f655fa4c9e8b", "reference_period": "2026-08-01", "divergence_reason": "Diferença de conferência", "counted_balance_cents": 38000, "opening_balance_cents": 50000}	Diferença de conferência
46aeaf9b-9ae4-4ab2-89b7-942fd5186ba9	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	closed	physical_cash_periods	9182c323-0cd9-4ba2-baf1-ef24a4f020cd	2026-08-30 13:45:47.228092+00	{"id": "9182c323-0cd9-4ba2-baf1-ef24a4f020cd", "status": "open", "closed_at": null, "closed_by": null, "counted_at": "2026-08-30T13:45:47.228092+00:00", "counted_by": "55555555-5555-4555-8555-555555555555", "created_at": "2026-08-30T13:45:47.228092+00:00", "created_by": "55555555-5555-4555-8555-555555555555", "cash_register_id": "2cc158bc-9c98-4d26-9ca6-f655fa4c9e8b", "reference_period": "2026-08-01", "divergence_reason": "Diferença de conferência", "counted_balance_cents": 38000, "opening_balance_cents": 50000}	{"id": "9182c323-0cd9-4ba2-baf1-ef24a4f020cd", "status": "closed", "closed_at": "2026-08-30T13:45:47.228092+00:00", "closed_by": "55555555-5555-4555-8555-555555555555", "counted_at": "2026-08-30T13:45:47.228092+00:00", "counted_by": "55555555-5555-4555-8555-555555555555", "created_at": "2026-08-30T13:45:47.228092+00:00", "created_by": "55555555-5555-4555-8555-555555555555", "cash_register_id": "2cc158bc-9c98-4d26-9ca6-f655fa4c9e8b", "reference_period": "2026-08-01", "divergence_reason": "Diferença de conferência", "counted_balance_cents": 38000, "opening_balance_cents": 50000}	cash_period_closed
0de98c90-c4ef-4d14-901e-803d6809e58a	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	closed	monthly_closings	79345c37-7efa-4f23-86f7-fa4c2b0a6628	2026-08-30 13:45:47.228092+00	\N	{"id": "79345c37-7efa-4f23-86f7-fa4c2b0a6628", "status": "closed", "closed_at": "2026-08-30T13:45:47.228092+00:00", "approved_by": "55555555-5555-4555-8555-555555555555", "submitted_by": "55555555-5555-4555-8555-555555555555", "congregation_id": "22222222-2222-4222-8222-222222222222", "reference_period": "2026-08-01", "adjustments_cents": 0, "opening_balance_cents": 0}	monthly_period_closed
10ea4553-8d1a-47f8-8205-98c82f82452b	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	requested	period_reopening_requests	07cd66ed-6f47-46e0-937a-5895537bea52	2026-08-30 13:45:47.228092+00	\N	{"id": "07cd66ed-6f47-46e0-937a-5895537bea52", "reason": "Solicitação para validar isolamento de aprovação", "status": "pending", "approved_at": null, "approved_by": null, "requested_at": "2026-08-30T13:45:47.228092+00:00", "requested_by": "55555555-5555-4555-8555-555555555555", "congregation_id": "22222222-2222-4222-8222-222222222222", "reference_period": "2026-08-01"}	Solicitação para validar isolamento de aprovação
79f915c5-619d-42f4-8927-29029d79d71a	44444444-4444-4444-8444-444444444444	11111111-1111-4111-8111-111111111111	created	physical_cash_registers	f8ccf6a7-321c-4853-9779-4cced36bdcc2	2026-08-30 13:45:47.228092+00	\N	{"id": "f8ccf6a7-321c-4853-9779-4cced36bdcc2", "name": "Caixa da Sede 1788097548", "active": true, "created_at": "2026-08-30T13:45:47.228092+00:00", "created_by": "44444444-4444-4444-8444-444444444444", "congregation_id": "11111111-1111-4111-8111-111111111111"}	cash_register_created
d5fbf147-2d42-4f14-81ba-fd31dc5c533d	55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	closed	monthly_closings	79345c37-7efa-4f23-86f7-fa4c2b0a6628	2026-08-30 13:45:47.228092+00	\N	{"id": "79345c37-7efa-4f23-86f7-fa4c2b0a6628", "status": "closed", "closed_at": "2026-08-30T13:45:47.228092+00:00", "approved_by": "55555555-5555-4555-8555-555555555555", "submitted_by": "55555555-5555-4555-8555-555555555555", "congregation_id": "22222222-2222-4222-8222-222222222222", "reference_period": "2026-08-01", "adjustments_cents": 0, "opening_balance_cents": 0}	monthly_period_closed
f01d0bc8-95ce-4864-9246-f7907c97b281	bd051a16-d31a-476d-950a-fb4404b7090a	11111111-1111-4111-8111-111111111111	created	entries	d3bc1453-7643-4472-bccd-26f8782b5467	2026-08-30 15:02:52.593705+00	\N	{"id": "d3bc1453-7643-4472-bccd-26f8782b5467", "origin": "Campo de Homologação (Teste)", "purpose": "Teste ", "category": "offering", "created_at": "2026-08-30T15:02:52.593705+00:00", "receipt_id": null, "occurred_on": "2026-08-30", "recorded_by": "bd051a16-d31a-476d-950a-fb4404b7090a", "amount_cents": 10000, "payment_method": "cash", "congregation_id": "11111111-1111-4111-8111-111111111111"}	financial_record_created
32545c18-f81e-477b-aab3-47b776a776f4	bd051a16-d31a-476d-950a-fb4404b7090a	11111111-1111-4111-8111-111111111111	created	entries	17ab1fa6-1bc1-4387-ac21-35527393ce8f	2026-08-30 15:08:04.736286+00	\N	{"id": "17ab1fa6-1bc1-4387-ac21-35527393ce8f", "origin": "Campo de Homologação (Teste)", "purpose": "Teste ", "category": "offering", "created_at": "2026-08-30T15:08:04.736286+00:00", "receipt_id": null, "occurred_on": "2026-08-30", "recorded_by": "bd051a16-d31a-476d-950a-fb4404b7090a", "amount_cents": 5000, "payment_method": "cash", "congregation_id": "11111111-1111-4111-8111-111111111111"}	financial_record_created
5f1df70b-82ac-4759-80c8-c7905936c540	bd051a16-d31a-476d-950a-fb4404b7090a	11111111-1111-4111-8111-111111111111	created	expenses	b35c662f-1ab7-45bb-a87e-94af805e7273	2026-08-30 15:20:54.410655+00	\N	{"id": "b35c662f-1ab7-45bb-a87e-94af805e7273", "status": "pending", "vendor": null, "purpose": "Teste ", "category": "Teste de Homologação", "created_at": "2026-08-30T15:20:54.410655+00:00", "receipt_id": null, "approved_at": null, "approved_by": null, "cost_center": null, "description": "Teste de Homologação", "occurred_on": "2026-08-30", "recorded_by": "bd051a16-d31a-476d-950a-fb4404b7090a", "amount_cents": 3000, "payment_method": "cash", "congregation_id": "11111111-1111-4111-8111-111111111111"}	financial_record_created
054defc1-9352-4bc1-b6d2-4e6a3c95baa4	bd051a16-d31a-476d-950a-fb4404b7090a	126c27ce-7c6d-4574-a168-b4b1bfcdacd9	created	congregations	126c27ce-7c6d-4574-a168-b4b1bfcdacd9	2026-10-04 01:38:25.292362+00	\N	{"id": "126c27ce-7c6d-4574-a168-b4b1bfcdacd9", "city": "Avaré", "name": "Batista Sede", "state": "SP", "active": true, "parent_id": null, "created_at": "2026-10-04T01:38:25.292362+00:00", "leader_name": null, "is_headquarters": true, "organization_type": "church"}	platform_admin_organization_create
869750ff-0441-4949-bcce-e487f1d0d413	bd051a16-d31a-476d-950a-fb4404b7090a	11111111-1111-4111-8111-111111111111	approved	expenses	b35c662f-1ab7-45bb-a87e-94af805e7273	2026-08-30 15:21:26.331693+00	{"id": "b35c662f-1ab7-45bb-a87e-94af805e7273", "status": "pending", "vendor": null, "purpose": "Teste ", "category": "Teste de Homologação", "created_at": "2026-08-30T15:20:54.410655+00:00", "receipt_id": null, "approved_at": null, "approved_by": null, "cost_center": null, "description": "Teste de Homologação", "occurred_on": "2026-08-30", "recorded_by": "bd051a16-d31a-476d-950a-fb4404b7090a", "amount_cents": 3000, "payment_method": "cash", "congregation_id": "11111111-1111-4111-8111-111111111111"}	{"id": "b35c662f-1ab7-45bb-a87e-94af805e7273", "status": "approved", "vendor": null, "purpose": "Teste ", "category": "Teste de Homologação", "created_at": "2026-08-30T15:20:54.410655+00:00", "receipt_id": null, "approved_at": "2026-08-30T15:21:26.331693+00:00", "approved_by": "bd051a16-d31a-476d-950a-fb4404b7090a", "cost_center": null, "description": "Teste de Homologação", "occurred_on": "2026-08-30", "recorded_by": "bd051a16-d31a-476d-950a-fb4404b7090a", "amount_cents": 3000, "payment_method": "cash", "congregation_id": "11111111-1111-4111-8111-111111111111"}	expense_approval
59a9ee4a-fc80-4121-92da-0dff824412f3	bd051a16-d31a-476d-950a-fb4404b7090a	11111111-1111-4111-8111-111111111111	created	headquarters_transfers	a802c3f4-56ce-4ae6-8483-2c169722aeef	2026-08-30 15:22:57.226193+00	\N	{"id": "a802c3f4-56ce-4ae6-8483-2c169722aeef", "reason": "Teste", "status": "requested", "created_at": "2026-08-30T15:22:57.226193+00:00", "receipt_id": null, "approved_by": null, "occurred_on": null, "requested_by": "bd051a16-d31a-476d-950a-fb4404b7090a", "destination_name": "Teste homologação", "reference_period": "2026-08-01", "amount_sent_cents": 5000, "amount_received_cents": null, "origin_congregation_id": "11111111-1111-4111-8111-111111111111"}	financial_record_created
f9a69e4a-e9c7-4c68-bd05-6861b3d00298	bd051a16-d31a-476d-950a-fb4404b7090a	11111111-1111-4111-8111-111111111111	approved	headquarters_transfers	a802c3f4-56ce-4ae6-8483-2c169722aeef	2026-08-30 15:23:01.042941+00	{"id": "a802c3f4-56ce-4ae6-8483-2c169722aeef", "reason": "Teste", "status": "requested", "created_at": "2026-08-30T15:22:57.226193+00:00", "receipt_id": null, "approved_by": null, "occurred_on": null, "requested_by": "bd051a16-d31a-476d-950a-fb4404b7090a", "destination_name": "Teste homologação", "reference_period": "2026-08-01", "amount_sent_cents": 5000, "amount_received_cents": null, "origin_congregation_id": "11111111-1111-4111-8111-111111111111"}	{"id": "a802c3f4-56ce-4ae6-8483-2c169722aeef", "reason": "Teste", "status": "approved", "created_at": "2026-08-30T15:22:57.226193+00:00", "receipt_id": null, "approved_by": "bd051a16-d31a-476d-950a-fb4404b7090a", "occurred_on": null, "requested_by": "bd051a16-d31a-476d-950a-fb4404b7090a", "destination_name": "Teste homologação", "reference_period": "2026-08-01", "amount_sent_cents": 5000, "amount_received_cents": null, "origin_congregation_id": "11111111-1111-4111-8111-111111111111"}	transfer_approval
54427361-8b1c-475c-88ca-1504e5a7d05f	bd051a16-d31a-476d-950a-fb4404b7090a	11111111-1111-4111-8111-111111111111	confirmed	headquarters_transfers	a802c3f4-56ce-4ae6-8483-2c169722aeef	2026-08-30 15:23:40.61768+00	{"id": "a802c3f4-56ce-4ae6-8483-2c169722aeef", "reason": "Teste", "status": "approved", "created_at": "2026-08-30T15:22:57.226193+00:00", "receipt_id": null, "approved_by": "bd051a16-d31a-476d-950a-fb4404b7090a", "occurred_on": null, "requested_by": "bd051a16-d31a-476d-950a-fb4404b7090a", "destination_name": "Teste homologação", "reference_period": "2026-08-01", "amount_sent_cents": 5000, "amount_received_cents": null, "origin_congregation_id": "11111111-1111-4111-8111-111111111111"}	{"id": "a802c3f4-56ce-4ae6-8483-2c169722aeef", "reason": "Teste", "status": "confirmed", "created_at": "2026-08-30T15:22:57.226193+00:00", "receipt_id": null, "approved_by": "bd051a16-d31a-476d-950a-fb4404b7090a", "occurred_on": null, "requested_by": "bd051a16-d31a-476d-950a-fb4404b7090a", "destination_name": "Teste homologação", "reference_period": "2026-08-01", "amount_sent_cents": 5000, "amount_received_cents": 5000, "origin_congregation_id": "11111111-1111-4111-8111-111111111111"}	transfer_reconciled
16280be5-1584-40b0-985f-88a15f76a057	bd051a16-d31a-476d-950a-fb4404b7090a	11111111-1111-4111-8111-111111111111	opened	physical_cash_periods	772ffa7f-b383-42b1-b7a2-86799976b113	2026-08-30 15:27:34.472242+00	\N	{"id": "772ffa7f-b383-42b1-b7a2-86799976b113", "status": "open", "closed_at": null, "closed_by": null, "counted_at": null, "counted_by": null, "created_at": "2026-08-30T15:27:34.472242+00:00", "created_by": "bd051a16-d31a-476d-950a-fb4404b7090a", "cash_register_id": "f8ccf6a7-321c-4853-9779-4cced36bdcc2", "reference_period": "2026-08-01", "divergence_reason": null, "counted_balance_cents": null, "opening_balance_cents": 7000}	cash_period_opened
94753dd0-fbaf-4d95-83e2-94baff18272b	bd051a16-d31a-476d-950a-fb4404b7090a	11111111-1111-4111-8111-111111111111	created	physical_cash_movements	dc610778-f2ad-4e34-9185-5256cd77c371	2026-08-30 15:29:52.387616+00	\N	{"id": "dc610778-f2ad-4e34-9185-5256cd77c371", "reason": "Teste", "created_at": "2026-08-30T15:29:52.387616+00:00", "created_by": "bd051a16-d31a-476d-950a-fb4404b7090a", "amount_cents": 2000, "movement_type": "cash_in", "cash_period_id": "772ffa7f-b383-42b1-b7a2-86799976b113", "idempotency_key": "b36859aa-fc85-4fd7-a374-12d482a6af98", "source_entity_id": null, "source_entity_type": null}	Teste
0d62534c-73b4-46a3-af09-3cd048342d35	bd051a16-d31a-476d-950a-fb4404b7090a	11111111-1111-4111-8111-111111111111	created	physical_cash_movements	a0cf11cc-5c75-4bad-97d0-e24713f8d34b	2026-08-30 15:31:31.324193+00	\N	{"id": "a0cf11cc-5c75-4bad-97d0-e24713f8d34b", "reason": "Teste", "created_at": "2026-08-30T15:31:31.324193+00:00", "created_by": "bd051a16-d31a-476d-950a-fb4404b7090a", "amount_cents": 1000, "movement_type": "cash_expense", "cash_period_id": "772ffa7f-b383-42b1-b7a2-86799976b113", "idempotency_key": "b2fd9042-4457-47bd-ae44-59aa9a5ab989", "source_entity_id": null, "source_entity_type": null}	Teste
5121a63e-72db-4b14-9fc8-e961fe12a960	bd051a16-d31a-476d-950a-fb4404b7090a	11111111-1111-4111-8111-111111111111	closed	monthly_closings	e16e57ef-9fd6-45d1-bfef-483ea3bd184a	2026-08-30 15:48:54.597828+00	\N	{"id": "e16e57ef-9fd6-45d1-bfef-483ea3bd184a", "status": "closed", "closed_at": "2026-08-30T15:48:54.597828+00:00", "approved_by": "bd051a16-d31a-476d-950a-fb4404b7090a", "submitted_by": "44444444-4444-4444-8444-444444444444", "congregation_id": "11111111-1111-4111-8111-111111111111", "reference_period": "2026-08-01", "adjustments_cents": 0, "opening_balance_cents": 0}	monthly_period_closed
3299a214-f2c7-40bf-8662-245e4bdde0e5	bd051a16-d31a-476d-950a-fb4404b7090a	671d1287-0401-4d6a-badc-4b00d0e3fa7a	created	congregations	671d1287-0401-4d6a-badc-4b00d0e3fa7a	2026-10-03 22:42:25.291722+00	\N	{"id": "671d1287-0401-4d6a-badc-4b00d0e3fa7a", "city": "Avaré", "name": "Hyroshido's Ong", "state": "SP", "active": true, "created_at": "2026-10-03T22:42:25.291722+00:00", "is_headquarters": true, "organization_type": "ong"}	platform_admin_organization_create
2ff555dc-d005-4781-8b18-72ce6f33b97b	bd051a16-d31a-476d-950a-fb4404b7090a	\N	updated	memberships	bd051a16-d31a-476d-950a-fb4404b7090a	2026-10-03 22:43:43.339886+00	\N	{"assignments": [{"role": "central_admin", "permissions": {"audit.read": true, "closing.submit": true, "financial.read": true, "financial.write": true, "financial.approve": true}, "congregationId": "11111111-1111-4111-8111-111111111111"}, {"role": "central_admin", "permissions": {"audit.read": true, "closing.submit": true, "financial.read": true, "financial.write": true, "financial.approve": true}, "congregationId": "22222222-2222-4222-8222-222222222222"}, {"role": "central_admin", "permissions": {"audit.read": true, "closing.submit": true, "financial.read": true, "financial.write": true, "financial.approve": true}, "congregationId": "33333333-3333-4333-8333-333333333333"}, {"role": "central_admin", "permissions": {"audit.read": true, "closing.submit": true, "financial.read": true, "financial.write": true, "financial.approve": true}, "congregationId": "671d1287-0401-4d6a-badc-4b00d0e3fa7a"}]}	platform_admin_access_update
cd037ad7-929a-4b16-be66-b0adfb9d0bc2	bd051a16-d31a-476d-950a-fb4404b7090a	\N	updated	memberships	bd051a16-d31a-476d-950a-fb4404b7090a	2026-10-04 02:36:07.465965+00	\N	{"assignments": [{"role": "central_admin", "permissions": {"audit.read": true, "closing.submit": true, "financial.read": true, "hierarchy.view": true, "financial.write": true, "financial.approve": true, "hierarchy.financial.read": true}, "congregationId": "11111111-1111-4111-8111-111111111111"}, {"role": "central_admin", "permissions": {"audit.read": true, "closing.submit": true, "financial.read": true, "hierarchy.view": false, "financial.write": true, "financial.approve": true, "hierarchy.financial.read": true}, "congregationId": "22222222-2222-4222-8222-222222222222"}, {"role": "central_admin", "permissions": {"audit.read": true, "closing.submit": true, "financial.read": true, "hierarchy.view": false, "financial.write": true, "financial.approve": true, "hierarchy.financial.read": true}, "congregationId": "33333333-3333-4333-8333-333333333333"}, {"role": "central_admin", "permissions": {"audit.read": true, "closing.submit": true, "financial.read": true, "hierarchy.view": true, "financial.write": true, "financial.approve": true, "hierarchy.financial.read": true}, "congregationId": "671d1287-0401-4d6a-badc-4b00d0e3fa7a"}, {"role": "central_admin", "permissions": {"audit.read": true, "closing.submit": true, "financial.read": true, "hierarchy.view": true, "financial.write": true, "financial.approve": true, "hierarchy.financial.read": true}, "congregationId": "126c27ce-7c6d-4574-a168-b4b1bfcdacd9"}]}	platform_admin_access_update
e7d24484-2682-442e-a6e9-f2614f4971ca	bd051a16-d31a-476d-950a-fb4404b7090a	\N	updated	memberships	9b0d1fd7-9c93-4817-8b9f-16fa57436b8e	2026-10-04 13:26:11.581518+00	\N	{"assignments": [{"role": "viewer", "permissions": {"audit.read": false, "closing.submit": false, "financial.read": true, "hierarchy.view": false, "financial.write": false, "financial.approve": false, "hierarchy.financial.read": false}, "congregationId": "11111111-1111-4111-8111-111111111111"}, {"role": "viewer", "permissions": {"audit.read": false, "closing.submit": false, "financial.read": true, "hierarchy.view": false, "financial.write": false, "financial.approve": false, "hierarchy.financial.read": false}, "congregationId": "22222222-2222-4222-8222-222222222222"}, {"role": "viewer", "permissions": {"audit.read": false, "closing.submit": false, "financial.read": true, "hierarchy.view": false, "financial.write": false, "financial.approve": false, "hierarchy.financial.read": false}, "congregationId": "33333333-3333-4333-8333-333333333333"}, {"role": "viewer", "permissions": {"audit.read": false, "closing.submit": false, "financial.read": true, "hierarchy.view": false, "financial.write": false, "financial.approve": false, "hierarchy.financial.read": false}, "congregationId": "671d1287-0401-4d6a-badc-4b00d0e3fa7a"}, {"role": "viewer", "permissions": {"audit.read": false, "closing.submit": false, "financial.read": true, "hierarchy.view": false, "financial.write": false, "financial.approve": false, "hierarchy.financial.read": false}, "congregationId": "126c27ce-7c6d-4574-a168-b4b1bfcdacd9"}]}	platform_admin_access_update
\.


--
-- Data for Name: congregations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.congregations (id, name, city, active, created_at, state, organization_type, is_headquarters, parent_id, leader_name, organization_level) FROM stdin;
671d1287-0401-4d6a-badc-4b00d0e3fa7a	Hyroshido's Ong	Avaré	t	2026-10-03 22:42:25.291722+00	SP	ong	t	\N	\N	national_hq
126c27ce-7c6d-4574-a168-b4b1bfcdacd9	Batista Sede	Avaré	t	2026-10-04 01:38:25.292362+00	SP	church	t	\N	\N	national_hq
11111111-1111-4111-8111-111111111111	Sede ADB	Avaré	t	2026-08-12 23:51:23.443969+00	SP	church	t	\N	\N	national_hq
22222222-2222-4222-8222-222222222222	Congregação A	Avaré	t	2026-08-12 23:51:23.443969+00	SP	church	f	11111111-1111-4111-8111-111111111111	\N	local_congregation
33333333-3333-4333-8333-333333333333	Congregação A	Avaré	t	2026-08-12 23:51:23.443969+00	SP	church	f	126c27ce-7c6d-4574-a168-b4b1bfcdacd9	\N	local_congregation
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, congregation_id, entity_type, entity_id, storage_path, file_name, content_type, uploaded_by, created_at) FROM stdin;
\.


--
-- Data for Name: entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.entries (id, congregation_id, occurred_on, amount_cents, category, origin, payment_method, purpose, receipt_id, recorded_by, created_at, is_internal_transfer) FROM stdin;
15892c8c-3b1f-412d-90e7-273951d57e56	22222222-2222-4222-8222-222222222222	2026-08-13	5000	tithe	fixture	pix	entry validation	\N	66666666-6666-4666-8666-666666666666	2026-08-13 00:07:49.675311+00	f
9d9e5ab8-5c9a-455e-a700-4bf1a4b60f68	22222222-2222-4222-8222-222222222222	2026-08-15	5000	tithe	fixture	pix	entry validation	\N	66666666-6666-4666-8666-666666666666	2026-08-15 15:06:14.349101+00	f
cf310dcd-aec3-435a-a4e2-9cbd0446db04	22222222-2222-4222-8222-222222222222	2026-08-15	5000	tithe	fixture	pix	entry validation	\N	66666666-6666-4666-8666-666666666666	2026-08-15 15:08:21.147813+00	f
e8887134-c249-4ff8-a1aa-49961547410c	22222222-2222-4222-8222-222222222222	2026-08-30	5000	tithe	fixture	pix	entry validation	\N	66666666-6666-4666-8666-666666666666	2026-08-30 13:38:59.909666+00	f
51863888-f680-49af-a94a-3779fb343fa5	22222222-2222-4222-8222-222222222222	2026-08-30	5000	tithe	fixture	pix	entry validation	\N	66666666-6666-4666-8666-666666666666	2026-08-30 13:41:34.564735+00	f
39f1e518-fc7c-4a38-bf25-46bf42020c10	22222222-2222-4222-8222-222222222222	2026-08-30	5000	tithe	fixture	pix	entry validation	\N	66666666-6666-4666-8666-666666666666	2026-08-30 13:45:46.264065+00	f
e548cd31-f3fe-4d97-b00a-196ed7cc5647	22222222-2222-4222-8222-222222222222	2026-08-30	50000	tithe	cash	cash	adjustment fixture	\N	66666666-6666-4666-8666-666666666666	2026-08-30 13:45:47.228092+00	f
d3bc1453-7643-4472-bccd-26f8782b5467	11111111-1111-4111-8111-111111111111	2026-08-30	10000	offering	Campo de Homologação (Teste)	cash	Teste 	\N	bd051a16-d31a-476d-950a-fb4404b7090a	2026-08-30 15:02:52.593705+00	f
17ab1fa6-1bc1-4387-ac21-35527393ce8f	11111111-1111-4111-8111-111111111111	2026-08-30	5000	offering	Campo de Homologação (Teste)	cash	Teste 	\N	bd051a16-d31a-476d-950a-fb4404b7090a	2026-08-30 15:08:04.736286+00	f
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, congregation_id, occurred_on, amount_cents, category, description, vendor, payment_method, purpose, cost_center, receipt_id, approved_by, recorded_by, created_at, status, approved_at, is_internal_transfer) FROM stdin;
d58416be-8d0c-4172-9fba-e34b418b80d1	22222222-2222-4222-8222-222222222222	2026-08-13	1500	missions	fixture expense	fixture vendor	pix	expense validation	general	\N	55555555-5555-4555-8555-555555555555	55555555-5555-4555-8555-555555555555	2026-08-13 00:07:49.675311+00	approved	2026-08-13 00:07:49.675311+00	f
f500ba57-cc1a-4b1d-af71-2b3558bce699	22222222-2222-4222-8222-222222222222	2026-08-15	1500	missions	fixture expense	fixture vendor	pix	expense validation	general	\N	55555555-5555-4555-8555-555555555555	55555555-5555-4555-8555-555555555555	2026-08-15 15:06:14.349101+00	approved	2026-08-15 15:06:14.349101+00	f
ad159a95-feef-424e-806e-1edf8f1bf599	22222222-2222-4222-8222-222222222222	2026-08-15	1500	missions	fixture expense	fixture vendor	pix	expense validation	general	\N	55555555-5555-4555-8555-555555555555	55555555-5555-4555-8555-555555555555	2026-08-15 15:08:21.147813+00	approved	2026-08-15 15:08:21.147813+00	f
fed4c9c1-8483-48e2-8215-5427c63f14aa	22222222-2222-4222-8222-222222222222	2026-08-30	1500	missions	fixture expense	fixture vendor	pix	expense validation	general	\N	55555555-5555-4555-8555-555555555555	55555555-5555-4555-8555-555555555555	2026-08-30 13:38:59.909666+00	approved	2026-08-30 13:38:59.909666+00	f
7ff43511-df8d-4431-9016-472a1edf4f1f	22222222-2222-4222-8222-222222222222	2026-08-30	1500	missions	fixture expense	fixture vendor	pix	expense validation	general	\N	55555555-5555-4555-8555-555555555555	55555555-5555-4555-8555-555555555555	2026-08-30 13:41:34.564735+00	approved	2026-08-30 13:41:34.564735+00	f
5ddaa9e6-4e9f-41e8-bd73-3b3db67a3b0a	22222222-2222-4222-8222-222222222222	2026-08-30	1500	missions	fixture expense	fixture vendor	pix	expense validation	general	\N	55555555-5555-4555-8555-555555555555	55555555-5555-4555-8555-555555555555	2026-08-30 13:45:46.264065+00	approved	2026-08-30 13:45:46.264065+00	f
743b86a1-ada8-4d5b-a07f-1dc0fa81dc4c	22222222-2222-4222-8222-222222222222	2026-08-30	30000	supplies	reversal fixture	fixture	cash	reversal	general	\N	55555555-5555-4555-8555-555555555555	66666666-6666-4666-8666-666666666666	2026-08-30 13:45:47.228092+00	approved	2026-08-30 13:45:47.228092+00	f
b35c662f-1ab7-45bb-a87e-94af805e7273	11111111-1111-4111-8111-111111111111	2026-08-30	3000	Teste de Homologação	Teste de Homologação	\N	cash	Teste 	\N	\N	bd051a16-d31a-476d-950a-fb4404b7090a	bd051a16-d31a-476d-950a-fb4404b7090a	2026-08-30 15:20:54.410655+00	approved	2026-08-30 15:21:26.331693+00	f
\.


--
-- Data for Name: financial_adjustments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.financial_adjustments (id, congregation_id, reference_period, entity_type, entity_id, amount_cents, reason, status, created_by, created_at, idempotency_key) FROM stdin;
9a864139-2f0a-43cb-82bb-5717e186e61e	22222222-2222-4222-8222-222222222222	2026-08-01	entries	e548cd31-f3fe-4d97-b00a-196ed7cc5647	5000	Correção de valor registrado	posted	55555555-5555-4555-8555-555555555555	2026-08-30 13:45:47.228092+00	10000000-0000-4000-8000-000000000001
7a4cf5d1-ec3f-481e-a21c-367f31f1dec8	22222222-2222-4222-8222-222222222222	2026-08-01	entries	e548cd31-f3fe-4d97-b00a-196ed7cc5647	-5000	Correção negativa de valor registrado	posted	55555555-5555-4555-8555-555555555555	2026-08-30 13:45:47.228092+00	10000000-0000-4000-8000-000000000002
\.


--
-- Data for Name: financial_reversals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.financial_reversals (id, congregation_id, reference_period, entity_type, entity_id, amount_cents, reason, status, created_by, created_at, idempotency_key) FROM stdin;
03d76cf6-2b54-4dcb-ac39-8af5d5f60912	22222222-2222-4222-8222-222222222222	2026-08-01	expenses	743b86a1-ada8-4d5b-a07f-1dc0fa81dc4c	30000	Pagamento cancelado	posted	55555555-5555-4555-8555-555555555555	2026-08-30 13:45:47.228092+00	20000000-0000-4000-8000-000000000001
\.


--
-- Data for Name: headquarters_transfers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.headquarters_transfers (id, origin_congregation_id, destination_name, reference_period, amount_sent_cents, amount_received_cents, occurred_on, status, reason, requested_by, approved_by, receipt_id, created_at) FROM stdin;
78fcc951-2c2b-4a20-9638-9637f2eab065	22222222-2222-4222-8222-222222222222	Sede	2026-08-01	2000	2000	2026-08-13	sent	fixture transfer	66666666-6666-4666-8666-666666666666	55555555-5555-4555-8555-555555555555	\N	2026-08-13 00:07:49.675311+00
933ba47b-d9f7-4ad5-a4d9-200f12ae97fc	22222222-2222-4222-8222-222222222222	Sede	2026-08-01	2000	2000	2026-08-15	sent	fixture transfer	66666666-6666-4666-8666-666666666666	55555555-5555-4555-8555-555555555555	\N	2026-08-15 15:06:14.349101+00
75c68176-bf47-4540-9502-082795956d0a	22222222-2222-4222-8222-222222222222	Sede	2026-08-01	2000	2000	2026-08-15	sent	fixture transfer	66666666-6666-4666-8666-666666666666	55555555-5555-4555-8555-555555555555	\N	2026-08-15 15:08:21.147813+00
725542b9-40eb-403d-8fd1-1d6550f24b45	22222222-2222-4222-8222-222222222222	Sede	2026-08-01	2000	2000	2026-08-30	sent	fixture transfer	66666666-6666-4666-8666-666666666666	55555555-5555-4555-8555-555555555555	\N	2026-08-30 13:38:59.909666+00
e827e66e-3c80-4c4b-ab01-3991f7003e22	22222222-2222-4222-8222-222222222222	Sede	2026-08-01	2000	2000	2026-08-30	sent	fixture transfer	66666666-6666-4666-8666-666666666666	55555555-5555-4555-8555-555555555555	\N	2026-08-30 13:41:34.564735+00
03593171-ca20-4824-add2-88689c6fdaaa	22222222-2222-4222-8222-222222222222	Sede	2026-08-01	2000	2000	2026-08-30	sent	fixture transfer	66666666-6666-4666-8666-666666666666	55555555-5555-4555-8555-555555555555	\N	2026-08-30 13:45:46.264065+00
a802c3f4-56ce-4ae6-8483-2c169722aeef	11111111-1111-4111-8111-111111111111	Teste homologação	2026-08-01	5000	5000	\N	confirmed	Teste	bd051a16-d31a-476d-950a-fb4404b7090a	bd051a16-d31a-476d-950a-fb4404b7090a	\N	2026-08-30 15:22:57.226193+00
\.


--
-- Data for Name: membership_permission_overrides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.membership_permission_overrides (user_id, congregation_id, financial_read, financial_write, financial_approve, closing_submit, audit_read, updated_at, hierarchy_view, hierarchy_financial_read) FROM stdin;
bd051a16-d31a-476d-950a-fb4404b7090a	11111111-1111-4111-8111-111111111111	t	t	t	t	t	2026-10-04 02:36:07.465965+00	t	t
bd051a16-d31a-476d-950a-fb4404b7090a	22222222-2222-4222-8222-222222222222	t	t	t	t	t	2026-10-04 02:36:07.465965+00	f	t
bd051a16-d31a-476d-950a-fb4404b7090a	33333333-3333-4333-8333-333333333333	t	t	t	t	t	2026-10-04 02:36:07.465965+00	f	t
bd051a16-d31a-476d-950a-fb4404b7090a	671d1287-0401-4d6a-badc-4b00d0e3fa7a	t	t	t	t	t	2026-10-04 02:36:07.465965+00	t	t
bd051a16-d31a-476d-950a-fb4404b7090a	126c27ce-7c6d-4574-a168-b4b1bfcdacd9	t	t	t	t	t	2026-10-04 02:36:07.465965+00	t	t
9b0d1fd7-9c93-4817-8b9f-16fa57436b8e	11111111-1111-4111-8111-111111111111	t	f	f	f	f	2026-10-04 13:26:11.581518+00	f	f
9b0d1fd7-9c93-4817-8b9f-16fa57436b8e	22222222-2222-4222-8222-222222222222	t	f	f	f	f	2026-10-04 13:26:11.581518+00	f	f
9b0d1fd7-9c93-4817-8b9f-16fa57436b8e	33333333-3333-4333-8333-333333333333	t	f	f	f	f	2026-10-04 13:26:11.581518+00	f	f
9b0d1fd7-9c93-4817-8b9f-16fa57436b8e	671d1287-0401-4d6a-badc-4b00d0e3fa7a	t	f	f	f	f	2026-10-04 13:26:11.581518+00	f	f
9b0d1fd7-9c93-4817-8b9f-16fa57436b8e	126c27ce-7c6d-4574-a168-b4b1bfcdacd9	t	f	f	f	f	2026-10-04 13:26:11.581518+00	f	f
\.


--
-- Data for Name: memberships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.memberships (user_id, congregation_id, role, created_at) FROM stdin;
44444444-4444-4444-8444-444444444444	11111111-1111-4111-8111-111111111111	central_admin	2026-08-12 23:51:23.443969+00
55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	congregation_admin	2026-08-12 23:51:23.443969+00
66666666-6666-4666-8666-666666666666	22222222-2222-4222-8222-222222222222	treasurer	2026-08-12 23:51:23.443969+00
77777777-7777-4777-8777-777777777777	22222222-2222-4222-8222-222222222222	auditor	2026-08-12 23:51:23.443969+00
88888888-8888-4888-8888-888888888888	22222222-2222-4222-8222-222222222222	viewer	2026-08-12 23:51:23.443969+00
99999999-9999-4999-8999-999999999999	33333333-3333-4333-8333-333333333333	treasurer	2026-08-13 00:03:23.671495+00
aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa	11111111-1111-4111-8111-111111111111	congregation_admin	2026-08-15 15:06:12.495879+00
bd051a16-d31a-476d-950a-fb4404b7090a	11111111-1111-4111-8111-111111111111	central_admin	2026-10-04 02:36:07.465965+00
bd051a16-d31a-476d-950a-fb4404b7090a	22222222-2222-4222-8222-222222222222	central_admin	2026-10-04 02:36:07.465965+00
bd051a16-d31a-476d-950a-fb4404b7090a	33333333-3333-4333-8333-333333333333	central_admin	2026-10-04 02:36:07.465965+00
bd051a16-d31a-476d-950a-fb4404b7090a	671d1287-0401-4d6a-badc-4b00d0e3fa7a	central_admin	2026-10-04 02:36:07.465965+00
bd051a16-d31a-476d-950a-fb4404b7090a	126c27ce-7c6d-4574-a168-b4b1bfcdacd9	central_admin	2026-10-04 02:36:07.465965+00
9b0d1fd7-9c93-4817-8b9f-16fa57436b8e	11111111-1111-4111-8111-111111111111	viewer	2026-10-04 13:26:11.581518+00
9b0d1fd7-9c93-4817-8b9f-16fa57436b8e	22222222-2222-4222-8222-222222222222	viewer	2026-10-04 13:26:11.581518+00
9b0d1fd7-9c93-4817-8b9f-16fa57436b8e	33333333-3333-4333-8333-333333333333	viewer	2026-10-04 13:26:11.581518+00
9b0d1fd7-9c93-4817-8b9f-16fa57436b8e	671d1287-0401-4d6a-badc-4b00d0e3fa7a	viewer	2026-10-04 13:26:11.581518+00
9b0d1fd7-9c93-4817-8b9f-16fa57436b8e	126c27ce-7c6d-4574-a168-b4b1bfcdacd9	viewer	2026-10-04 13:26:11.581518+00
\.


--
-- Data for Name: monthly_closings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.monthly_closings (congregation_id, reference_period, opening_balance_cents, adjustments_cents, status, submitted_by, approved_by, closed_at, id) FROM stdin;
22222222-2222-4222-8222-222222222222	2026-08-01	0	0	closed	55555555-5555-4555-8555-555555555555	55555555-5555-4555-8555-555555555555	2026-08-30 13:45:47.228092+00	79345c37-7efa-4f23-86f7-fa4c2b0a6628
11111111-1111-4111-8111-111111111111	2026-08-01	0	0	closed	44444444-4444-4444-8444-444444444444	bd051a16-d31a-476d-950a-fb4404b7090a	2026-08-30 15:48:54.597828+00	e16e57ef-9fd6-45d1-bfef-483ea3bd184a
\.


--
-- Data for Name: period_reopening_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.period_reopening_requests (id, congregation_id, reference_period, reason, status, requested_by, approved_by, requested_at, approved_at) FROM stdin;
0b51b0a1-88e7-4192-bf41-fecd0864b42a	11111111-1111-4111-8111-111111111111	2026-08-01	Correção da prestação de contas da Sede	approved	aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa	44444444-4444-4444-8444-444444444444	2026-08-30 13:45:47.228092+00	2026-08-30 13:45:47.228092+00
07cd66ed-6f47-46e0-937a-5895537bea52	22222222-2222-4222-8222-222222222222	2026-08-01	Solicitação para validar isolamento de aprovação	pending	55555555-5555-4555-8555-555555555555	\N	2026-08-30 13:45:47.228092+00	\N
\.


--
-- Data for Name: physical_cash_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.physical_cash_movements (id, cash_period_id, movement_type, amount_cents, reason, source_entity_type, source_entity_id, created_by, created_at, idempotency_key) FROM stdin;
b9b20beb-b71d-4674-b43d-ff9e877cb668	32039a17-c10b-4899-b430-cbecf893804f	cash_expense	30000	Despesa dentro do saldo	\N	\N	55555555-5555-4555-8555-555555555555	2026-08-30 13:45:47.228092+00	30000000-0000-4000-8000-000000000004
59936992-7258-45fa-95fa-b2929bde4045	9182c323-0cd9-4ba2-baf1-ef24a4f020cd	cash_in	100000	Entrada em espécie	\N	\N	55555555-5555-4555-8555-555555555555	2026-08-30 13:45:47.228092+00	30000000-0000-4000-8000-000000000001
c09a9415-c797-46fa-9315-7e676f15235b	9182c323-0cd9-4ba2-baf1-ef24a4f020cd	cash_expense	30000	Despesa em espécie	\N	\N	55555555-5555-4555-8555-555555555555	2026-08-30 13:45:47.228092+00	30000000-0000-4000-8000-000000000002
38a842a1-6f27-42b0-bd3f-2399dd3a014f	9182c323-0cd9-4ba2-baf1-ef24a4f020cd	deposit	80000	Depósito bancário	\N	\N	55555555-5555-4555-8555-555555555555	2026-08-30 13:45:47.228092+00	30000000-0000-4000-8000-000000000003
dc610778-f2ad-4e34-9185-5256cd77c371	772ffa7f-b383-42b1-b7a2-86799976b113	cash_in	2000	Teste	\N	\N	bd051a16-d31a-476d-950a-fb4404b7090a	2026-08-30 15:29:52.387616+00	b36859aa-fc85-4fd7-a374-12d482a6af98
a0cf11cc-5c75-4bad-97d0-e24713f8d34b	772ffa7f-b383-42b1-b7a2-86799976b113	cash_expense	1000	Teste	\N	\N	bd051a16-d31a-476d-950a-fb4404b7090a	2026-08-30 15:31:31.324193+00	b2fd9042-4457-47bd-ae44-59aa9a5ab989
\.


--
-- Data for Name: physical_cash_periods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.physical_cash_periods (id, cash_register_id, reference_period, opening_balance_cents, status, counted_balance_cents, counted_by, counted_at, divergence_reason, closed_by, closed_at, created_by, created_at) FROM stdin;
32039a17-c10b-4899-b430-cbecf893804f	1506721f-f566-4286-b74c-3b2bfd0d1db9	2026-08-01	50000	closed	20000	55555555-5555-4555-8555-555555555555	2026-08-30 13:45:47.228092+00	\N	55555555-5555-4555-8555-555555555555	2026-08-30 13:45:47.228092+00	55555555-5555-4555-8555-555555555555	2026-08-30 13:45:47.228092+00
9182c323-0cd9-4ba2-baf1-ef24a4f020cd	2cc158bc-9c98-4d26-9ca6-f655fa4c9e8b	2026-08-01	50000	closed	38000	55555555-5555-4555-8555-555555555555	2026-08-30 13:45:47.228092+00	Diferença de conferência	55555555-5555-4555-8555-555555555555	2026-08-30 13:45:47.228092+00	55555555-5555-4555-8555-555555555555	2026-08-30 13:45:47.228092+00
772ffa7f-b383-42b1-b7a2-86799976b113	f8ccf6a7-321c-4853-9779-4cced36bdcc2	2026-08-01	7000	open	\N	\N	\N	\N	\N	\N	bd051a16-d31a-476d-950a-fb4404b7090a	2026-08-30 15:27:34.472242+00
\.


--
-- Data for Name: physical_cash_registers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.physical_cash_registers (id, congregation_id, name, active, created_by, created_at) FROM stdin;
1506721f-f566-4286-b74c-3b2bfd0d1db9	22222222-2222-4222-8222-222222222222	Caixa de saldo 1788097548	t	55555555-5555-4555-8555-555555555555	2026-08-30 13:45:47.228092+00
2cc158bc-9c98-4d26-9ca6-f655fa4c9e8b	22222222-2222-4222-8222-222222222222	Caixa de conferência 1788097548	t	55555555-5555-4555-8555-555555555555	2026-08-30 13:45:47.228092+00
f8ccf6a7-321c-4853-9779-4cced36bdcc2	11111111-1111-4111-8111-111111111111	Caixa da Sede 1788097548	t	44444444-4444-4444-8444-444444444444	2026-08-30 13:45:47.228092+00
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-08-12 20:49:52
20211116045059	2026-08-12 20:49:52
20211116050929	2026-08-12 20:49:52
20211116051442	2026-08-12 20:49:52
20211116212300	2026-08-12 20:49:52
20211116213355	2026-08-12 20:49:52
20211116213934	2026-08-12 20:49:52
20211116214523	2026-08-12 20:49:52
20211122062447	2026-08-12 20:49:52
20211124070109	2026-08-12 20:49:52
20211202204204	2026-08-12 20:49:52
20211202204605	2026-08-12 20:49:52
20211210212804	2026-08-12 20:49:52
20211228014915	2026-08-12 20:49:52
20220107221237	2026-08-12 20:49:52
20220228202821	2026-08-12 20:49:52
20220312004840	2026-08-12 20:49:52
20220603231003	2026-08-12 20:49:52
20220603232444	2026-08-12 20:49:52
20220615214548	2026-08-12 20:49:52
20220712093339	2026-08-12 20:49:52
20220908172859	2026-08-12 20:49:52
20220916233421	2026-08-12 20:49:52
20230119133233	2026-08-12 20:49:52
20230128025114	2026-08-12 20:49:52
20230128025212	2026-08-12 20:49:52
20230227211149	2026-08-12 20:49:52
20230228184745	2026-08-12 20:49:52
20230308225145	2026-08-12 20:49:52
20230328144023	2026-08-12 20:49:52
20231018144023	2026-08-12 20:49:52
20231204144023	2026-08-12 20:49:52
20231204144024	2026-08-12 20:49:52
20231204144025	2026-08-12 20:49:52
20240108234812	2026-08-12 20:49:52
20240109165339	2026-08-12 20:49:52
20240227174441	2026-08-12 20:49:52
20240311171622	2026-08-12 20:49:52
20240321100241	2026-08-12 20:49:52
20240401105812	2026-08-12 20:49:52
20240418121054	2026-08-12 20:49:52
20240523004032	2026-08-12 20:49:52
20240618124746	2026-08-12 20:49:52
20240801235015	2026-08-12 20:49:52
20240805133720	2026-08-12 20:49:52
20240827160934	2026-08-12 20:49:52
20240919163303	2026-08-12 20:49:52
20240919163305	2026-08-12 20:49:52
20241019105805	2026-08-12 20:49:52
20241030150047	2026-08-12 20:49:52
20241108114728	2026-08-12 20:49:52
20241121104152	2026-08-12 20:49:52
20241130184212	2026-08-12 20:49:52
20241220035512	2026-08-12 20:49:52
20241220123912	2026-08-12 20:49:52
20241224161212	2026-08-12 20:49:52
20250107150512	2026-08-12 20:49:52
20250110162412	2026-08-12 20:49:52
20250123174212	2026-08-12 20:49:52
20250128220012	2026-08-12 20:49:52
20250506224012	2026-08-12 20:49:52
20250523164012	2026-08-12 20:49:52
20250714121412	2026-08-12 20:49:52
20250905041441	2026-08-12 20:49:52
20251103001201	2026-08-12 20:49:52
20251120212548	2026-08-12 20:49:52
20251120215549	2026-08-12 20:49:52
20260218120000	2026-08-12 20:49:52
20260326120000	2026-08-12 20:49:52
20260514120000	2026-08-12 20:49:52
20260527120000	2026-08-12 20:49:52
20260528120000	2026-08-12 20:49:52
20260603120000	2026-08-12 20:49:52
20260605120000	2026-08-12 20:49:52
20260606110000	2026-08-12 20:49:52
20260616120000	2026-08-12 20:49:52
20260624120000	2026-08-12 20:49:52
20260626120000	2026-08-12 20:49:52
20260706120000	2026-08-12 20:49:52
20260707120000	2026-08-12 20:49:52
20260709120000	2026-08-12 20:49:52
20260714120000	2026-09-07 14:45:50
20260827120000	2026-09-30 23:56:24
20260914120000	2026-09-30 23:56:24
20260916120000	2026-09-30 23:56:24
20260922120000	2026-09-30 23:56:25
20260925120000	2026-09-30 23:56:25
20260928120000	2026-10-17 00:33:15
20261002120000	2026-10-17 00:33:15
20261008120000	2026-10-25 15:53:12
20261009120000	2026-10-25 15:53:12
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter, selected_columns) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type, versioning_status, lifecycle_configuration, lifecycle_configuration_generation) FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-08-12 20:49:52.612477
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-08-12 20:49:52.621118
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-08-12 20:49:52.625452
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-08-12 20:49:52.639844
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-08-12 20:49:52.655121
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-08-12 20:49:52.659589
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-08-12 20:49:52.664993
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-08-12 20:49:52.669768
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-08-12 20:49:52.674247
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-08-12 20:49:52.678686
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-08-12 20:49:52.683137
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-08-12 20:49:52.687859
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-08-12 20:49:52.692584
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-08-12 20:49:52.696682
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-08-12 20:49:52.700805
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-08-12 20:49:52.728706
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-08-12 20:49:52.733945
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-08-12 20:49:52.73794
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-08-12 20:49:52.74194
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-08-12 20:49:52.747766
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-08-12 20:49:52.752568
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-08-12 20:49:52.758506
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-08-12 20:49:52.772418
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-08-12 20:49:52.78552
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-08-12 20:49:52.790267
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-08-12 20:49:52.794687
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-08-12 20:49:52.799273
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-08-12 20:49:52.803851
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-08-12 20:49:52.807521
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-08-12 20:49:52.811193
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-08-12 20:49:52.814821
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-08-12 20:49:52.818615
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-08-12 20:49:52.822861
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-08-12 20:49:52.826516
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-08-12 20:49:52.830346
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-08-12 20:49:52.834041
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-08-12 20:49:52.837649
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-08-12 20:49:52.841472
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-08-12 20:49:52.846009
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-08-12 20:49:52.854863
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-08-12 20:49:52.858594
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-08-12 20:49:52.862654
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-08-12 20:49:52.866225
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-08-12 20:49:52.869691
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-08-12 20:49:52.874045
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-08-12 20:49:52.879109
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-08-12 20:49:52.892244
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-08-12 20:49:52.896989
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-08-12 20:49:52.901229
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-08-12 20:49:52.92014
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-08-12 20:49:52.925475
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-08-12 20:49:53.117382
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-08-12 20:49:53.119973
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-08-12 20:49:53.130078
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-08-12 20:49:53.132402
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-08-12 20:49:53.13379
56	fix-optimized-search-function	b823ed1e418101032fa01374edc9a436e54e3ed4	2026-08-12 20:49:53.138888
57	s3-multipart-uploads-metadata	f127886e00d1b374fadbc7c6b31e09336aad5287	2026-08-12 20:49:53.14447
58	operation-ergonomics	00ca5d483b3fe0d522133d9002ccc5df98365120	2026-08-12 20:49:53.148477
59	drop-unused-functions	38456f13e39691c2bbb4b5151d0d1cdbabd4a8c4	2026-08-12 20:49:53.153045
60	optimize-existing-functions-again	db35e1c91a9201e59f4fef8d972c2f277d68b157	2026-08-12 20:49:53.157648
61	mark-filename-immutable	fe0096517ae9d60aaec1d110172ba9036dc66bb7	2026-08-12 20:49:53.162241
62	object-versioning-core	0b855f00ff3be0bfca91efee02a9858912491a9a	2026-08-30 13:22:34.16807
63	fix-search-name-relative-to-prefix	c7485e417624f795ce8bb2da21927f48e088904d	2026-08-30 13:22:34.199779
64	fix-search-by-timestamp-sqli	0af424ecd388a39bb1645184b222185a12149675	2026-08-30 13:22:34.215387
66	objects-current-version-index	191466c93aa2c46a00e36505577c5fcab8d7cb4b	2026-09-07 14:44:53.066984
67	objects-null-version-index	15bfe8c35b66642b6c78ba60060fa8793bd2207a	2026-09-07 14:44:53.076442
65	objects-key-version-index	da319c4b89ba800ce795d1b699f3a70675138058	2026-09-07 14:44:53.053118
68	bucket-lifecycle-configuration	3c08f6f889922f399519722a932b51007c11bebc	2026-09-30 23:40:49.581472
69	validate-bucket-lifecycle-constraints	4febacaaaa0e61e2b783bef081fe03a287e65eb3	2026-09-30 23:40:49.626769
70	list-objects-with-versions	5c17c3777616cd8d7b18b82835525fa3205af57b	2026-09-30 23:40:49.632094
71	objects-delete-marker-index	6d14858e66c66f8d6accf8a2630aefd1527fddba	2026-09-30 23:40:49.687596
72	drop-bucketid-objname-index	302beb09e1b469d7d4db19566f2389d280b64aa3	2026-09-30 23:40:49.704003
73	revoke-grants-to-unused-operations	ba9244051be09f22f714fc0170a2539f8b5f0e68	2026-10-17 00:33:19.633465
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, archived_at, is_delete_marker, is_versioned) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata, metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: supabase_migrations; Owner: postgres
--

COPY supabase_migrations.schema_migrations (version, statements, name) FROM stdin;
0001	{"create type public.app_role as enum ('central_admin', 'congregation_admin', 'treasurer', 'auditor', 'viewer')","create type public.transfer_status as enum ('planned', 'requested', 'approved', 'sent', 'confirmed', 'questioned', 'cancelled')","create type public.closing_status as enum ('open', 'submitted', 'approved', 'questioned', 'closed')","create table public.congregations (\n  id uuid primary key default gen_random_uuid(),\n  name text not null,\n  city text not null,\n  active boolean not null default true,\n  created_at timestamptz not null default now()\n)","create table public.memberships (\n  user_id uuid not null references auth.users(id) on delete cascade,\n  congregation_id uuid not null references public.congregations(id) on delete cascade,\n  role public.app_role not null,\n  created_at timestamptz not null default now(),\n  primary key (user_id, congregation_id)\n)","create table public.entries (\n  id uuid primary key default gen_random_uuid(),\n  congregation_id uuid not null references public.congregations(id),\n  occurred_on date not null,\n  amount_cents bigint not null check (amount_cents > 0),\n  category text not null,\n  origin text not null,\n  payment_method text not null,\n  purpose text,\n  receipt_id text,\n  recorded_by uuid not null references auth.users(id),\n  created_at timestamptz not null default now()\n)","create table public.expenses (\n  id uuid primary key default gen_random_uuid(),\n  congregation_id uuid not null references public.congregations(id),\n  occurred_on date not null,\n  amount_cents bigint not null check (amount_cents > 0),\n  category text not null,\n  description text not null,\n  vendor text,\n  payment_method text not null,\n  purpose text,\n  cost_center text,\n  receipt_id text,\n  approved_by uuid references auth.users(id),\n  recorded_by uuid not null references auth.users(id),\n  created_at timestamptz not null default now()\n)","create table public.headquarters_transfers (\n  id uuid primary key default gen_random_uuid(),\n  origin_congregation_id uuid not null references public.congregations(id),\n  destination_name text not null,\n  reference_period date not null,\n  amount_sent_cents bigint check (amount_sent_cents > 0),\n  amount_received_cents bigint check (amount_received_cents >= 0),\n  occurred_on date,\n  status public.transfer_status not null default 'planned',\n  reason text not null,\n  requested_by uuid not null references auth.users(id),\n  approved_by uuid references auth.users(id),\n  receipt_id text,\n  created_at timestamptz not null default now()\n)","create table public.monthly_closings (\n  congregation_id uuid not null references public.congregations(id),\n  reference_period date not null,\n  opening_balance_cents bigint not null default 0,\n  adjustments_cents bigint not null default 0,\n  status public.closing_status not null default 'open',\n  submitted_by uuid references auth.users(id),\n  approved_by uuid references auth.users(id),\n  closed_at timestamptz,\n  primary key (congregation_id, reference_period)\n)","create table public.audit_events (\n  id uuid primary key default gen_random_uuid(),\n  actor_id uuid not null references auth.users(id),\n  congregation_id uuid references public.congregations(id),\n  action text not null,\n  entity text not null,\n  entity_id uuid not null,\n  occurred_at timestamptz not null default now(),\n  before_data jsonb,\n  after_data jsonb,\n  reason text\n)","create or replace function public.is_congregation_member(target_congregation uuid)\nreturns boolean language sql security definer set search_path = public as $$\n  select exists (\n    select 1 from public.memberships\n    where user_id = auth.uid() and congregation_id = target_congregation\n  );\n$$","alter table public.congregations enable row level security","alter table public.memberships enable row level security","alter table public.entries enable row level security","alter table public.expenses enable row level security","alter table public.headquarters_transfers enable row level security","alter table public.monthly_closings enable row level security","alter table public.audit_events enable row level security","create policy \\"members can read their congregations\\" on public.congregations for select using (public.is_congregation_member(id))","create policy \\"members can read their entries\\" on public.entries for select using (public.is_congregation_member(congregation_id))","create policy \\"members can read their expenses\\" on public.expenses for select using (public.is_congregation_member(congregation_id))","create policy \\"members can read their transfers\\" on public.headquarters_transfers for select using (public.is_congregation_member(origin_congregation_id))","create policy \\"members can read their closings\\" on public.monthly_closings for select using (public.is_congregation_member(congregation_id))","create policy \\"members can read their audit events\\" on public.audit_events for select using (congregation_id is not null and public.is_congregation_member(congregation_id))","-- Inserts, updates and approvals must be added through server-side commands that\n-- check role permissions and append an audit_events row in the same transaction."}	finance_core
0002	{"create type public.document_entity as enum ('entry', 'expense', 'transfer', 'correction')","create table public.documents (\n  id uuid primary key default gen_random_uuid(),\n  congregation_id uuid not null references public.congregations(id),\n  entity_type public.document_entity not null,\n  entity_id uuid not null,\n  storage_path text not null,\n  file_name text not null,\n  content_type text not null,\n  uploaded_by uuid not null references auth.users(id),\n  created_at timestamptz not null default now()\n)","create index documents_entity_idx on public.documents(entity_type, entity_id)","create or replace function public.has_congregation_role(target_congregation uuid, allowed_roles public.app_role[])\nreturns boolean language sql security definer set search_path = public as $$\n  select exists (\n    select 1 from public.memberships\n    where user_id = auth.uid()\n      and congregation_id = target_congregation\n      and role = any(allowed_roles)\n  );\n$$","create or replace function public.period_is_closed(target_congregation uuid, target_period date)\nreturns boolean language sql security definer set search_path = public as $$\n  select exists (\n    select 1 from public.monthly_closings\n    where congregation_id = target_congregation\n      and reference_period = date_trunc('month', target_period)::date\n      and status = 'closed'\n  );\n$$","create or replace function public.prevent_closed_period_changes()\nreturns trigger language plpgsql security definer set search_path = public as $$\ndeclare\n  target_congregation uuid;\n  target_period date;\nbegin\n  if tg_table_name = 'headquarters_transfers' then\n    target_congregation := coalesce(new.origin_congregation_id, old.origin_congregation_id);\n    target_period := coalesce(new.occurred_on, new.reference_period, old.occurred_on, old.reference_period);\n  else\n    target_congregation := coalesce(new.congregation_id, old.congregation_id);\n    target_period := coalesce(new.occurred_on, old.occurred_on);\n  end if;\n  if public.period_is_closed(target_congregation, target_period) then\n    raise exception 'closed_period_requires_correction_or_reopening';\n  end if;\n  return coalesce(new, old);\nend;\n$$","create trigger entries_closed_period_guard before insert or update or delete on public.entries\nfor each row execute function public.prevent_closed_period_changes()","create trigger expenses_closed_period_guard before insert or update or delete on public.expenses\nfor each row execute function public.prevent_closed_period_changes()","create trigger transfers_closed_period_guard before insert or update or delete on public.headquarters_transfers\nfor each row execute function public.prevent_closed_period_changes()","create or replace function public.audit_financial_insert()\nreturns trigger language plpgsql security definer set search_path = public as $$\ndeclare\n  target_actor uuid;\n  target_congregation uuid;\n  target_entity text;\nbegin\n  if tg_table_name = 'headquarters_transfers' then\n    target_actor := new.requested_by;\n    target_congregation := new.origin_congregation_id;\n  else\n    target_actor := new.recorded_by;\n    target_congregation := new.congregation_id;\n  end if;\n  target_entity := tg_table_name;\n  insert into public.audit_events(actor_id, congregation_id, action, entity, entity_id, after_data, reason)\n  values (target_actor, target_congregation, 'created', target_entity, new.id, to_jsonb(new), 'financial_record_created');\n  return new;\nend;\n$$","create trigger entries_audit_insert after insert on public.entries\nfor each row execute function public.audit_financial_insert()","create trigger expenses_audit_insert after insert on public.expenses\nfor each row execute function public.audit_financial_insert()","create trigger transfers_audit_insert after insert on public.headquarters_transfers\nfor each row execute function public.audit_financial_insert()","create or replace view public.congregation_monthly_summary\nwith (security_invoker = true) as\nwith months as (\n  select congregation_id, date_trunc('month', occurred_on)::date as reference_period from public.entries\n  union select congregation_id, date_trunc('month', occurred_on)::date from public.expenses\n  union select origin_congregation_id, date_trunc('month', coalesce(occurred_on, reference_period))::date from public.headquarters_transfers\n), entry_totals as (\n  select congregation_id, date_trunc('month', occurred_on)::date reference_period, coalesce(sum(amount_cents), 0) entries\n  from public.entries group by congregation_id, date_trunc('month', occurred_on)::date\n), expense_totals as (\n  select congregation_id, date_trunc('month', occurred_on)::date reference_period, coalesce(sum(amount_cents), 0) expenses\n  from public.expenses group by congregation_id, date_trunc('month', occurred_on)::date\n), transfer_totals as (\n  select origin_congregation_id congregation_id, date_trunc('month', coalesce(occurred_on, reference_period))::date reference_period,\n    coalesce(sum(amount_sent_cents) filter (where status <> 'cancelled'), 0) transfers\n  from public.headquarters_transfers group by origin_congregation_id, date_trunc('month', coalesce(occurred_on, reference_period))::date\n)\nselect m.congregation_id, m.reference_period,\n  coalesce(c.opening_balance_cents, 0) opening_balance,\n  coalesce(e.entries, 0) entries,\n  coalesce(x.expenses, 0) expenses,\n  coalesce(t.transfers, 0) transfers,\n  coalesce(c.adjustments_cents, 0) adjustments,\n  coalesce(c.opening_balance_cents, 0) + coalesce(e.entries, 0) - coalesce(x.expenses, 0) - coalesce(t.transfers, 0) + coalesce(c.adjustments_cents, 0) closing_balance,\n  c.status closing_status\nfrom months m\nleft join public.monthly_closings c using (congregation_id, reference_period)\nleft join entry_totals e using (congregation_id, reference_period)\nleft join expense_totals x using (congregation_id, reference_period)\nleft join transfer_totals t using (congregation_id, reference_period)","alter table public.documents enable row level security","create policy \\"users can read their memberships\\" on public.memberships for select using (user_id = auth.uid())","create policy \\"members can read linked documents\\" on public.documents for select using (public.is_congregation_member(congregation_id))","create policy \\"finance roles can upload documents\\" on public.documents for insert with check (\n  uploaded_by = auth.uid() and public.has_congregation_role(congregation_id, array['central_admin', 'congregation_admin', 'treasurer']::public.app_role[])\n)","create policy \\"finance roles can create entries\\" on public.entries for insert with check (\n  recorded_by = auth.uid() and public.has_congregation_role(congregation_id, array['central_admin', 'congregation_admin', 'treasurer']::public.app_role[])\n)","create policy \\"finance roles can create expenses\\" on public.expenses for insert with check (\n  recorded_by = auth.uid() and public.has_congregation_role(congregation_id, array['central_admin', 'congregation_admin', 'treasurer']::public.app_role[])\n)","create policy \\"finance roles can create transfers\\" on public.headquarters_transfers for insert with check (\n  requested_by = auth.uid() and public.has_congregation_role(origin_congregation_id, array['central_admin', 'congregation_admin', 'treasurer']::public.app_role[])\n)","-- Financial rows have no UPDATE or DELETE policy. Corrections, estornos and\n-- authorized reopening must be implemented as audited server-side commands."}	integrity_and_documents
0003	{"create type public.expense_status as enum ('pending', 'approved', 'rejected', 'reversed')","alter table public.expenses add column status public.expense_status not null default 'pending'","alter table public.expenses add column approved_at timestamptz","alter table public.monthly_closings add column id uuid default gen_random_uuid()","alter table public.monthly_closings alter column id set not null","create unique index monthly_closings_id_idx on public.monthly_closings(id)","create or replace function public.require_open_period(target_congregation uuid, target_period date)\nreturns void language plpgsql security definer set search_path = public as $$\nbegin\n  if public.period_is_closed(target_congregation, target_period) then\n    raise exception 'closed_period_requires_correction_or_reopening';\n  end if;\nend;\n$$","create or replace function public.create_entry(\n  p_congregation_id uuid,\n  p_occurred_on date,\n  p_amount_cents bigint,\n  p_category text,\n  p_origin text,\n  p_payment_method text,\n  p_purpose text default null\n) returns public.entries\nlanguage plpgsql security definer set search_path = public as $$\ndeclare created_entry public.entries;\nbegin\n  if not public.has_congregation_role(p_congregation_id, array['central_admin', 'congregation_admin', 'treasurer']::public.app_role[]) then\n    raise exception 'financial_write_not_allowed';\n  end if;\n  perform public.require_open_period(p_congregation_id, p_occurred_on);\n  insert into public.entries (congregation_id, occurred_on, amount_cents, category, origin, payment_method, purpose, recorded_by)\n  values (p_congregation_id, p_occurred_on, p_amount_cents, p_category, p_origin, p_payment_method, p_purpose, auth.uid())\n  returning * into created_entry;\n  return created_entry;\nend;\n$$","create or replace function public.create_expense(\n  p_congregation_id uuid,\n  p_occurred_on date,\n  p_amount_cents bigint,\n  p_category text,\n  p_description text,\n  p_vendor text default null,\n  p_payment_method text default 'other',\n  p_purpose text default null,\n  p_cost_center text default null\n) returns public.expenses\nlanguage plpgsql security definer set search_path = public as $$\ndeclare created_expense public.expenses;\nbegin\n  if not public.has_congregation_role(p_congregation_id, array['central_admin', 'congregation_admin', 'treasurer']::public.app_role[]) then\n    raise exception 'financial_write_not_allowed';\n  end if;\n  perform public.require_open_period(p_congregation_id, p_occurred_on);\n  insert into public.expenses (congregation_id, occurred_on, amount_cents, category, description, vendor, payment_method, purpose, cost_center, recorded_by)\n  values (p_congregation_id, p_occurred_on, p_amount_cents, p_category, p_description, p_vendor, p_payment_method, p_purpose, p_cost_center, auth.uid())\n  returning * into created_expense;\n  return created_expense;\nend;\n$$","create or replace function public.approve_expense(p_expense_id uuid)\nreturns public.expenses language plpgsql security definer set search_path = public as $$\ndeclare target public.expenses; approved public.expenses;\nbegin\n  select * into target from public.expenses where id = p_expense_id for update;\n  if target.id is null then raise exception 'expense_not_found'; end if;\n  if not public.has_congregation_role(target.congregation_id, array['central_admin', 'congregation_admin']::public.app_role[]) then\n    raise exception 'financial_approval_not_allowed';\n  end if;\n  if target.status <> 'pending' then raise exception 'expense_not_pending'; end if;\n  update public.expenses set status = 'approved', approved_by = auth.uid(), approved_at = now() where id = p_expense_id returning * into approved;\n  insert into public.audit_events(actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason)\n  values (auth.uid(), target.congregation_id, 'approved', 'expenses', target.id, to_jsonb(target), to_jsonb(approved), 'expense_approval');\n  return approved;\nend;\n$$","create or replace function public.request_transfer(\n  p_origin_congregation_id uuid,\n  p_destination_name text,\n  p_reference_period date,\n  p_amount_sent_cents bigint,\n  p_reason text,\n  p_occurred_on date default null\n) returns public.headquarters_transfers\nlanguage plpgsql security definer set search_path = public as $$\ndeclare created_transfer public.headquarters_transfers;\nbegin\n  if not public.has_congregation_role(p_origin_congregation_id, array['central_admin', 'congregation_admin', 'treasurer']::public.app_role[]) then\n    raise exception 'transfer_write_not_allowed';\n  end if;\n  perform public.require_open_period(p_origin_congregation_id, coalesce(p_occurred_on, p_reference_period));\n  insert into public.headquarters_transfers (origin_congregation_id, destination_name, reference_period, amount_sent_cents, occurred_on, status, reason, requested_by)\n  values (p_origin_congregation_id, p_destination_name, date_trunc('month', p_reference_period)::date, p_amount_sent_cents, p_occurred_on, 'requested', p_reason, auth.uid())\n  returning * into created_transfer;\n  return created_transfer;\nend;\n$$","create or replace function public.approve_transfer(p_transfer_id uuid)\nreturns public.headquarters_transfers language plpgsql security definer set search_path = public as $$\ndeclare target public.headquarters_transfers; approved public.headquarters_transfers;\nbegin\n  select * into target from public.headquarters_transfers where id = p_transfer_id for update;\n  if target.id is null then raise exception 'transfer_not_found'; end if;\n  if not public.has_congregation_role(target.origin_congregation_id, array['central_admin', 'congregation_admin']::public.app_role[]) then\n    raise exception 'transfer_approval_not_allowed';\n  end if;\n  if target.status <> 'requested' then raise exception 'transfer_not_requested'; end if;\n  update public.headquarters_transfers set status = 'approved', approved_by = auth.uid() where id = p_transfer_id returning * into approved;\n  insert into public.audit_events(actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason)\n  values (auth.uid(), target.origin_congregation_id, 'approved', 'headquarters_transfers', target.id, to_jsonb(target), to_jsonb(approved), 'transfer_approval');\n  return approved;\nend;\n$$","create or replace function public.confirm_transfer(p_transfer_id uuid, p_amount_received_cents bigint)\nreturns public.headquarters_transfers language plpgsql security definer set search_path = public as $$\ndeclare target public.headquarters_transfers; confirmed public.headquarters_transfers; next_status public.transfer_status;\nbegin\n  select * into target from public.headquarters_transfers where id = p_transfer_id for update;\n  if target.id is null then raise exception 'transfer_not_found'; end if;\n  if not public.has_congregation_role(target.origin_congregation_id, array['central_admin']::public.app_role[]) then\n    raise exception 'headquarters_confirmation_not_allowed';\n  end if;\n  if target.status not in ('approved', 'sent') then raise exception 'transfer_not_ready_for_confirmation'; end if;\n  next_status := case when target.amount_sent_cents = p_amount_received_cents then 'confirmed' else 'questioned' end;\n  update public.headquarters_transfers set amount_received_cents = p_amount_received_cents, status = next_status where id = p_transfer_id returning * into confirmed;\n  insert into public.audit_events(actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason)\n  values (auth.uid(), target.origin_congregation_id, 'confirmed', 'headquarters_transfers', target.id, to_jsonb(target), to_jsonb(confirmed), case when next_status = 'confirmed' then 'transfer_reconciled' else 'transfer_divergence' end);\n  return confirmed;\nend;\n$$","create or replace function public.close_monthly_period(p_congregation_id uuid, p_reference_period date)\nreturns public.monthly_closings language plpgsql security definer set search_path = public as $$\ndeclare closing public.monthly_closings;\nbegin\n  if not public.has_congregation_role(p_congregation_id, array['central_admin', 'congregation_admin']::public.app_role[]) then\n    raise exception 'closing_not_allowed';\n  end if;\n  insert into public.monthly_closings (congregation_id, reference_period, status, submitted_by, approved_by, closed_at)\n  values (p_congregation_id, date_trunc('month', p_reference_period)::date, 'closed', auth.uid(), auth.uid(), now())\n  on conflict (congregation_id, reference_period) do update set status = 'closed', approved_by = auth.uid(), closed_at = now()\n  returning * into closing;\n  insert into public.audit_events(actor_id, congregation_id, action, entity, entity_id, after_data, reason)\n  values (auth.uid(), p_congregation_id, 'closed', 'monthly_closings', closing.id, to_jsonb(closing), 'monthly_period_closed');\n  return closing;\nend;\n$$","revoke all on function public.create_entry(uuid, date, bigint, text, text, text, text) from public","revoke all on function public.create_expense(uuid, date, bigint, text, text, text, text, text, text) from public","revoke all on function public.approve_expense(uuid) from public","revoke all on function public.request_transfer(uuid, text, date, bigint, text, date) from public","revoke all on function public.approve_transfer(uuid) from public","revoke all on function public.confirm_transfer(uuid, bigint) from public","revoke all on function public.close_monthly_period(uuid, date) from public","grant execute on function public.create_entry(uuid, date, bigint, text, text, text, text) to authenticated","grant execute on function public.create_expense(uuid, date, bigint, text, text, text, text, text, text) to authenticated","grant execute on function public.approve_expense(uuid) to authenticated","grant execute on function public.request_transfer(uuid, text, date, bigint, text, date) to authenticated","grant execute on function public.approve_transfer(uuid) to authenticated","grant execute on function public.confirm_transfer(uuid, bigint) to authenticated","grant execute on function public.close_monthly_period(uuid, date) to authenticated"}	financial_cycle_commands
0004	{"create type public.reopening_status as enum ('pending', 'approved', 'rejected')","create type public.correction_status as enum ('posted', 'reversed')","create type public.cash_movement_type as enum ('cash_in', 'cash_expense', 'withdrawal', 'deposit', 'physical_exit')","create type public.cash_period_status as enum ('open', 'closed')","create table public.period_reopening_requests (\n  id uuid primary key default gen_random_uuid(),\n  congregation_id uuid not null references public.congregations(id),\n  reference_period date not null,\n  reason text not null check (btrim(reason) <> ''),\n  status public.reopening_status not null default 'pending',\n  requested_by uuid not null references auth.users(id),\n  approved_by uuid references auth.users(id),\n  requested_at timestamptz not null default now(),\n  approved_at timestamptz,\n  unique (id, congregation_id, reference_period)\n)","create unique index period_reopening_pending_idx\n  on public.period_reopening_requests (congregation_id, reference_period)\n  where status = 'pending'","create table public.financial_adjustments (\n  id uuid primary key default gen_random_uuid(),\n  congregation_id uuid not null references public.congregations(id),\n  reference_period date not null,\n  entity_type text not null check (entity_type in ('entries', 'expenses')),\n  entity_id uuid not null,\n  amount_cents bigint not null check (amount_cents <> 0),\n  reason text not null check (btrim(reason) <> ''),\n  status public.correction_status not null default 'posted',\n  created_by uuid not null references auth.users(id),\n  created_at timestamptz not null default now(),\n  idempotency_key uuid not null,\n  unique (created_by, idempotency_key)\n)","create index financial_adjustments_entity_idx\n  on public.financial_adjustments (entity_type, entity_id)","create index financial_adjustments_period_idx\n  on public.financial_adjustments (congregation_id, reference_period)","create table public.financial_reversals (\n  id uuid primary key default gen_random_uuid(),\n  congregation_id uuid not null references public.congregations(id),\n  reference_period date not null,\n  entity_type text not null check (entity_type in ('entries', 'expenses')),\n  entity_id uuid not null,\n  amount_cents bigint not null check (amount_cents > 0),\n  reason text not null check (btrim(reason) <> ''),\n  status public.correction_status not null default 'posted',\n  created_by uuid not null references auth.users(id),\n  created_at timestamptz not null default now(),\n  idempotency_key uuid not null,\n  unique (created_by, idempotency_key),\n  unique (entity_type, entity_id)\n)","create index financial_reversals_period_idx\n  on public.financial_reversals (congregation_id, reference_period)","create table public.physical_cash_registers (\n  id uuid primary key default gen_random_uuid(),\n  congregation_id uuid not null references public.congregations(id),\n  name text not null check (btrim(name) <> ''),\n  active boolean not null default true,\n  created_by uuid not null references auth.users(id),\n  created_at timestamptz not null default now(),\n  unique (congregation_id, name)\n)","create table public.physical_cash_periods (\n  id uuid primary key default gen_random_uuid(),\n  cash_register_id uuid not null references public.physical_cash_registers(id),\n  reference_period date not null,\n  opening_balance_cents bigint not null check (opening_balance_cents >= 0),\n  status public.cash_period_status not null default 'open',\n  counted_balance_cents bigint,\n  counted_by uuid references auth.users(id),\n  counted_at timestamptz,\n  divergence_reason text,\n  closed_by uuid references auth.users(id),\n  closed_at timestamptz,\n  created_by uuid not null references auth.users(id),\n  created_at timestamptz not null default now(),\n  unique (cash_register_id, reference_period),\n  check (counted_balance_cents is null or counted_balance_cents >= 0),\n  check ((counted_balance_cents is null and counted_by is null and counted_at is null) or\n         (counted_balance_cents is not null and counted_by is not null and counted_at is not null))\n)","create table public.physical_cash_movements (\n  id uuid primary key default gen_random_uuid(),\n  cash_period_id uuid not null references public.physical_cash_periods(id),\n  movement_type public.cash_movement_type not null,\n  amount_cents bigint not null check (amount_cents > 0),\n  reason text not null check (btrim(reason) <> ''),\n  source_entity_type text,\n  source_entity_id uuid,\n  created_by uuid not null references auth.users(id),\n  created_at timestamptz not null default now(),\n  idempotency_key uuid not null,\n  unique (created_by, idempotency_key)\n)","create index physical_cash_periods_reference_idx\n  on public.physical_cash_periods (cash_register_id, reference_period)","create index physical_cash_movements_period_idx\n  on public.physical_cash_movements (cash_period_id, created_at)","alter table public.period_reopening_requests enable row level security","alter table public.financial_adjustments enable row level security","alter table public.financial_reversals enable row level security","alter table public.physical_cash_registers enable row level security","alter table public.physical_cash_periods enable row level security","alter table public.physical_cash_movements enable row level security","create policy \\"members can read reopening requests\\" on public.period_reopening_requests\n  for select using (public.is_congregation_member(congregation_id))","create policy \\"members can read adjustments\\" on public.financial_adjustments\n  for select using (public.is_congregation_member(congregation_id))","create policy \\"members can read reversals\\" on public.financial_reversals\n  for select using (public.is_congregation_member(congregation_id))","create policy \\"members can read cash registers\\" on public.physical_cash_registers\n  for select using (public.is_congregation_member(congregation_id))","create policy \\"members can read cash periods\\" on public.physical_cash_periods\n  for select using (\n    exists (\n      select 1\n      from public.physical_cash_registers r\n      where r.id = cash_register_id\n        and public.is_congregation_member(r.congregation_id)\n    )\n  )","create policy \\"members can read cash movements\\" on public.physical_cash_movements\n  for select using (\n    exists (\n      select 1\n      from public.physical_cash_periods p\n      join public.physical_cash_registers r on r.id = p.cash_register_id\n      where p.id = cash_period_id\n        and public.is_congregation_member(r.congregation_id)\n    )\n  )","create or replace view public.congregation_monthly_summary\nwith (security_invoker = true) as\nwith months as (\n  select congregation_id, date_trunc('month', occurred_on)::date as reference_period from public.entries\n  union select congregation_id, date_trunc('month', occurred_on)::date from public.expenses\n  union select origin_congregation_id, date_trunc('month', coalesce(occurred_on, reference_period))::date from public.headquarters_transfers\n  union select congregation_id, reference_period from public.financial_adjustments\n  union select congregation_id, reference_period from public.financial_reversals\n), entry_totals as (\n  select congregation_id, date_trunc('month', occurred_on)::date reference_period, coalesce(sum(amount_cents), 0) entries\n  from public.entries group by congregation_id, date_trunc('month', occurred_on)::date\n), expense_totals as (\n  select congregation_id, date_trunc('month', occurred_on)::date reference_period, coalesce(sum(amount_cents), 0) expenses\n  from public.expenses group by congregation_id, date_trunc('month', occurred_on)::date\n), transfer_totals as (\n  select origin_congregation_id congregation_id, date_trunc('month', coalesce(occurred_on, reference_period))::date reference_period,\n    coalesce(sum(amount_sent_cents) filter (where status <> 'cancelled'), 0) transfers\n  from public.headquarters_transfers group by origin_congregation_id, date_trunc('month', coalesce(occurred_on, reference_period))::date\n), adjustment_totals as (\n  select congregation_id, reference_period, coalesce(sum(amount_cents), 0)::bigint adjustments\n  from public.financial_adjustments where status = 'posted'\n  group by congregation_id, reference_period\n), reversal_totals as (\n  select congregation_id, reference_period,\n    coalesce(sum(case when entity_type = 'entries' then -amount_cents else amount_cents end), 0)::bigint reversals\n  from public.financial_reversals where status = 'posted'\n  group by congregation_id, reference_period\n)\nselect m.congregation_id, m.reference_period,\n  coalesce(c.opening_balance_cents, 0) opening_balance,\n  coalesce(e.entries, 0) entries,\n  coalesce(x.expenses, 0) expenses,\n  coalesce(t.transfers, 0) transfers,\n  coalesce(c.adjustments_cents, 0) + coalesce(a.adjustments, 0) adjustments,\n  coalesce(c.opening_balance_cents, 0) + coalesce(e.entries, 0) - coalesce(x.expenses, 0) - coalesce(t.transfers, 0)\n    + coalesce(a.adjustments, 0) + coalesce(r.reversals, 0) + coalesce(c.adjustments_cents, 0) closing_balance,\n  c.status closing_status\nfrom months m\nleft join public.monthly_closings c using (congregation_id, reference_period)\nleft join entry_totals e using (congregation_id, reference_period)\nleft join expense_totals x using (congregation_id, reference_period)\nleft join transfer_totals t using (congregation_id, reference_period)\nleft join adjustment_totals a using (congregation_id, reference_period)\nleft join reversal_totals r using (congregation_id, reference_period)","create or replace function public.require_authenticated()\nreturns uuid language plpgsql security definer set search_path = public as $$\nbegin\n  if auth.uid() is null then\n    raise exception 'authentication_required';\n  end if;\n  return auth.uid();\nend;\n$$","create or replace function public.request_period_reopening(\n  p_congregation_id uuid,\n  p_reference_period date,\n  p_reason text\n) returns public.period_reopening_requests\nlanguage plpgsql security definer set search_path = public as $$\ndeclare\n  actor uuid := public.require_authenticated();\n  request_row public.period_reopening_requests;\nbegin\n  if not public.has_congregation_role(p_congregation_id, array['congregation_admin', 'central_admin']::public.app_role[]) then\n    raise exception 'reopening_request_not_allowed';\n  end if;\n  if p_reason is null or btrim(p_reason) = '' then\n    raise exception 'reopening_reason_required';\n  end if;\n  if not public.period_is_closed(p_congregation_id, p_reference_period) then\n    raise exception 'period_not_closed';\n  end if;\n  insert into public.period_reopening_requests (congregation_id, reference_period, reason, requested_by)\n  values (p_congregation_id, date_trunc('month', p_reference_period)::date, p_reason, actor)\n  returning * into request_row;\n  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason)\n  values (actor, p_congregation_id, 'requested', 'period_reopening_requests', request_row.id, to_jsonb(request_row), p_reason);\n  return request_row;\nend;\n$$","create or replace function public.approve_period_reopening(\n  p_request_id uuid\n) returns public.period_reopening_requests\nlanguage plpgsql security definer set search_path = public as $$\ndeclare\n  actor uuid := public.require_authenticated();\n  request_row public.period_reopening_requests;\n  approved_row public.period_reopening_requests;\n  before_closing public.monthly_closings;\n  after_closing public.monthly_closings;\nbegin\n  select * into request_row from public.period_reopening_requests where id = p_request_id for update;\n  if request_row.id is null then raise exception 'reopening_request_not_found'; end if;\n  if request_row.status <> 'pending' then raise exception 'reopening_request_not_pending'; end if;\n  if request_row.requested_by = actor then raise exception 'reopening_self_approval_forbidden'; end if;\n  if not public.has_congregation_role(request_row.congregation_id, array['central_admin']::public.app_role[]) then\n    raise exception 'reopening_approval_not_allowed';\n  end if;\n  select * into before_closing from public.monthly_closings\n  where congregation_id = request_row.congregation_id and reference_period = request_row.reference_period for update;\n  if before_closing.status <> 'closed' then raise exception 'period_not_closed'; end if;\n  update public.monthly_closings\n  set status = 'open', closed_at = null, approved_by = actor\n  where congregation_id = request_row.congregation_id and reference_period = request_row.reference_period\n  returning * into after_closing;\n  update public.period_reopening_requests\n  set status = 'approved', approved_by = actor, approved_at = now()\n  where id = p_request_id\n  returning * into approved_row;\n  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason)\n  values (actor, request_row.congregation_id, 'approved', 'period_reopening_requests', p_request_id,\n    jsonb_build_object('request', to_jsonb(request_row), 'closing', to_jsonb(before_closing)),\n    jsonb_build_object('request', to_jsonb(approved_row), 'closing', to_jsonb(after_closing)), request_row.reason);\n  return approved_row;\nend;\n$$","create or replace function public.create_financial_adjustment(\n  p_congregation_id uuid,\n  p_entity_type text,\n  p_entity_id uuid,\n  p_amount_cents bigint,\n  p_reason text,\n  p_idempotency_key uuid\n) returns public.financial_adjustments\nlanguage plpgsql security definer set search_path = public as $$\ndeclare\n  actor uuid := public.require_authenticated();\n  source_congregation uuid;\n  source_period date;\n  adjustment public.financial_adjustments;\nbegin\n  if not public.has_congregation_role(p_congregation_id, array['congregation_admin', 'central_admin']::public.app_role[]) then\n    raise exception 'adjustment_not_allowed';\n  end if;\n  if p_amount_cents is null or p_amount_cents = 0 then raise exception 'adjustment_amount_invalid'; end if;\n  if p_reason is null or btrim(p_reason) = '' then raise exception 'adjustment_reason_required'; end if;\n  if p_idempotency_key is null then raise exception 'adjustment_idempotency_key_required'; end if;\n  if p_entity_type = 'entries' then\n    select congregation_id, occurred_on into source_congregation, source_period from public.entries where id = p_entity_id;\n  elsif p_entity_type = 'expenses' then\n    select congregation_id, occurred_on into source_congregation, source_period from public.expenses where id = p_entity_id;\n  else\n    raise exception 'adjustment_entity_type_invalid';\n  end if;\n  if source_congregation is null then raise exception 'adjustment_entity_not_found'; end if;\n  if source_congregation <> p_congregation_id then raise exception 'adjustment_cross_congregation_forbidden'; end if;\n  if public.period_is_closed(source_congregation, source_period) then raise exception 'closed_period_requires_reopening'; end if;\n  insert into public.financial_adjustments (congregation_id, reference_period, entity_type, entity_id, amount_cents, reason, created_by, idempotency_key)\n  values (p_congregation_id, date_trunc('month', source_period)::date, p_entity_type, p_entity_id, p_amount_cents, p_reason, actor, p_idempotency_key)\n  on conflict (created_by, idempotency_key) do nothing\n  returning * into adjustment;\n  if adjustment.id is null then\n    select * into adjustment from public.financial_adjustments where created_by = actor and idempotency_key = p_idempotency_key;\n    return adjustment;\n  end if;\n  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason)\n  values (actor, p_congregation_id, 'posted', 'financial_adjustments', adjustment.id, to_jsonb(adjustment), p_reason);\n  return adjustment;\nend;\n$$","create or replace function public.create_financial_reversal(\n  p_congregation_id uuid,\n  p_entity_type text,\n  p_entity_id uuid,\n  p_reason text,\n  p_idempotency_key uuid\n) returns public.financial_reversals\nlanguage plpgsql security definer set search_path = public as $$\ndeclare\n  actor uuid := public.require_authenticated();\n  source_congregation uuid;\n  source_period date;\n  source_amount bigint;\n  reversal public.financial_reversals;\nbegin\n  if not public.has_congregation_role(p_congregation_id, array['congregation_admin', 'central_admin']::public.app_role[]) then\n    raise exception 'reversal_not_allowed';\n  end if;\n  if p_reason is null or btrim(p_reason) = '' then raise exception 'reversal_reason_required'; end if;\n  if p_idempotency_key is null then raise exception 'reversal_idempotency_key_required'; end if;\n  if p_entity_type = 'entries' then\n    select congregation_id, occurred_on, amount_cents into source_congregation, source_period, source_amount from public.entries where id = p_entity_id;\n  elsif p_entity_type = 'expenses' then\n    select congregation_id, occurred_on, amount_cents into source_congregation, source_period, source_amount from public.expenses where id = p_entity_id;\n  else\n    raise exception 'reversal_entity_type_invalid';\n  end if;\n  if source_congregation is null then raise exception 'reversal_entity_not_found'; end if;\n  if source_congregation <> p_congregation_id then raise exception 'reversal_cross_congregation_forbidden'; end if;\n  if public.period_is_closed(source_congregation, source_period) then raise exception 'closed_period_requires_reopening'; end if;\n  insert into public.financial_reversals (congregation_id, reference_period, entity_type, entity_id, amount_cents, reason, created_by, idempotency_key)\n  values (p_congregation_id, date_trunc('month', source_period)::date, p_entity_type, p_entity_id, source_amount, p_reason, actor, p_idempotency_key)\n  on conflict (entity_type, entity_id) do nothing\n  returning * into reversal;\n  if reversal.id is null then\n    select * into reversal from public.financial_reversals where entity_type = p_entity_type and entity_id = p_entity_id;\n    if reversal.created_by = actor and reversal.idempotency_key = p_idempotency_key then return reversal; end if;\n    raise exception 'reversal_already_exists';\n  end if;\n  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason)\n  values (actor, p_congregation_id, 'posted', 'financial_reversals', reversal.id, to_jsonb(reversal), p_reason);\n  return reversal;\nend;\n$$","create or replace function public.create_cash_register(\n  p_congregation_id uuid,\n  p_name text\n) returns public.physical_cash_registers\nlanguage plpgsql security definer set search_path = public as $$\ndeclare actor uuid := public.require_authenticated(); register_row public.physical_cash_registers;\nbegin\n  if not public.has_congregation_role(p_congregation_id, array['treasurer', 'congregation_admin', 'central_admin']::public.app_role[]) then raise exception 'cash_register_not_allowed'; end if;\n  if p_name is null or btrim(p_name) = '' then raise exception 'cash_register_name_required'; end if;\n  insert into public.physical_cash_registers (congregation_id, name, created_by) values (p_congregation_id, p_name, actor) returning * into register_row;\n  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason) values (actor, p_congregation_id, 'created', 'physical_cash_registers', register_row.id, to_jsonb(register_row), 'cash_register_created');\n  return register_row;\nend;\n$$","create or replace function public.open_cash_period(\n  p_cash_register_id uuid,\n  p_reference_period date,\n  p_opening_balance_cents bigint\n) returns public.physical_cash_periods\nlanguage plpgsql security definer set search_path = public as $$\ndeclare actor uuid := public.require_authenticated(); register_row public.physical_cash_registers; period_row public.physical_cash_periods;\nbegin\n  select * into register_row from public.physical_cash_registers where id = p_cash_register_id;\n  if register_row.id is null then raise exception 'cash_register_not_found'; end if;\n  if not public.has_congregation_role(register_row.congregation_id, array['treasurer', 'congregation_admin', 'central_admin']::public.app_role[]) then raise exception 'cash_period_not_allowed'; end if;\n  if p_opening_balance_cents is null or p_opening_balance_cents < 0 then raise exception 'cash_opening_amount_invalid'; end if;\n  if public.period_is_closed(register_row.congregation_id, p_reference_period) then raise exception 'closed_period_requires_reopening'; end if;\n  insert into public.physical_cash_periods (cash_register_id, reference_period, opening_balance_cents, created_by)\n  values (p_cash_register_id, date_trunc('month', p_reference_period)::date, p_opening_balance_cents, actor)\n  returning * into period_row;\n  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason) values (actor, register_row.congregation_id, 'opened', 'physical_cash_periods', period_row.id, to_jsonb(period_row), 'cash_period_opened');\n  return period_row;\nend;\n$$","create or replace function public.record_cash_movement(\n  p_cash_period_id uuid,\n  p_movement_type public.cash_movement_type,\n  p_amount_cents bigint,\n  p_reason text,\n  p_idempotency_key uuid\n) returns public.physical_cash_movements\nlanguage plpgsql security definer set search_path = public as $$\ndeclare actor uuid := public.require_authenticated(); period_row public.physical_cash_periods; register_row public.physical_cash_registers; movement public.physical_cash_movements; expected_balance bigint;\nbegin\n  select p into period_row from public.physical_cash_periods p where p.id = p_cash_period_id for update;\n  select r into register_row from public.physical_cash_registers r where r.id = period_row.cash_register_id;\n  if period_row.id is null then raise exception 'cash_period_not_found'; end if;\n  if period_row.status <> 'open' then raise exception 'cash_period_not_open'; end if;\n  if not public.has_congregation_role(register_row.congregation_id, array['treasurer', 'congregation_admin', 'central_admin']::public.app_role[]) then raise exception 'cash_movement_not_allowed'; end if;\n  if p_amount_cents is null or p_amount_cents <= 0 then raise exception 'cash_amount_invalid'; end if;\n  if p_reason is null or btrim(p_reason) = '' then raise exception 'cash_reason_required'; end if;\n  if p_idempotency_key is null then raise exception 'cash_idempotency_key_required'; end if;\n  if public.period_is_closed(register_row.congregation_id, period_row.reference_period) then raise exception 'closed_period_requires_reopening'; end if;\n  select period_row.opening_balance_cents + coalesce(sum(case when movement_type = 'cash_in' then amount_cents else -amount_cents end), 0)\n  into expected_balance\n  from public.physical_cash_movements\n  where cash_period_id = p_cash_period_id;\n  if p_movement_type <> 'cash_in' and expected_balance < p_amount_cents then\n    raise exception 'cash_insufficient_balance';\n  end if;\n  insert into public.physical_cash_movements (cash_period_id, movement_type, amount_cents, reason, created_by, idempotency_key)\n  values (p_cash_period_id, p_movement_type, p_amount_cents, p_reason, actor, p_idempotency_key)\n  on conflict (created_by, idempotency_key) do nothing returning * into movement;\n  if movement.id is null then select * into movement from public.physical_cash_movements where created_by = actor and idempotency_key = p_idempotency_key; return movement; end if;\n  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason) values (actor, register_row.congregation_id, 'created', 'physical_cash_movements', movement.id, to_jsonb(movement), p_reason);\n  return movement;\nend;\n$$","create or replace function public.count_cash(\n  p_cash_period_id uuid,\n  p_counted_balance_cents bigint,\n  p_divergence_reason text default null\n) returns public.physical_cash_periods\nlanguage plpgsql security definer set search_path = public as $$\ndeclare actor uuid := public.require_authenticated(); period_row public.physical_cash_periods; register_row public.physical_cash_registers; updated_period public.physical_cash_periods; expected_balance bigint;\nbegin\n  select p into period_row from public.physical_cash_periods p where p.id = p_cash_period_id for update;\n  select r into register_row from public.physical_cash_registers r where r.id = period_row.cash_register_id;\n  if period_row.id is null then raise exception 'cash_period_not_found'; end if;\n  if period_row.status <> 'open' then raise exception 'cash_period_not_open'; end if;\n  if not public.has_congregation_role(register_row.congregation_id, array['treasurer', 'congregation_admin', 'central_admin']::public.app_role[]) then raise exception 'cash_count_not_allowed'; end if;\n  if p_counted_balance_cents is null or p_counted_balance_cents < 0 then raise exception 'cash_count_invalid'; end if;\n  select period_row.opening_balance_cents + coalesce(sum(case when movement_type = 'cash_in' then amount_cents else -amount_cents end), 0)\n  into expected_balance from public.physical_cash_movements where cash_period_id = p_cash_period_id;\n  if p_counted_balance_cents <> expected_balance and (p_divergence_reason is null or btrim(p_divergence_reason) = '') then raise exception 'cash_divergence_reason_required'; end if;\n  update public.physical_cash_periods set counted_balance_cents = p_counted_balance_cents, counted_by = actor, counted_at = now(), divergence_reason = p_divergence_reason where id = p_cash_period_id returning * into updated_period;\n  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason) values (actor, register_row.congregation_id, 'counted', 'physical_cash_periods', period_row.id, to_jsonb(period_row), to_jsonb(updated_period), coalesce(p_divergence_reason, 'cash_counted'));\n  return updated_period;\nend;\n$$","create or replace function public.close_cash_period(\n  p_cash_period_id uuid\n) returns public.physical_cash_periods\nlanguage plpgsql security definer set search_path = public as $$\ndeclare actor uuid := public.require_authenticated(); period_row public.physical_cash_periods; register_row public.physical_cash_registers; closed_period public.physical_cash_periods;\nbegin\n  select p into period_row from public.physical_cash_periods p where p.id = p_cash_period_id for update;\n  select r into register_row from public.physical_cash_registers r where r.id = period_row.cash_register_id;\n  if period_row.id is null then raise exception 'cash_period_not_found'; end if;\n  if not public.has_congregation_role(register_row.congregation_id, array['congregation_admin', 'central_admin']::public.app_role[]) then raise exception 'cash_close_not_allowed'; end if;\n  if period_row.status <> 'open' then raise exception 'cash_period_not_open'; end if;\n  if period_row.counted_balance_cents is null then raise exception 'cash_count_required'; end if;\n  update public.physical_cash_periods set status = 'closed', closed_by = actor, closed_at = now() where id = p_cash_period_id returning * into closed_period;\n  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason) values (actor, register_row.congregation_id, 'closed', 'physical_cash_periods', period_row.id, to_jsonb(period_row), to_jsonb(closed_period), 'cash_period_closed');\n  return closed_period;\nend;\n$$","revoke all on function public.require_authenticated() from public","revoke all on function public.request_period_reopening(uuid, date, text) from public","revoke all on function public.approve_period_reopening(uuid) from public","revoke all on function public.create_financial_adjustment(uuid, text, uuid, bigint, text, uuid) from public","revoke all on function public.create_financial_reversal(uuid, text, uuid, text, uuid) from public","revoke all on function public.create_cash_register(uuid, text) from public","revoke all on function public.open_cash_period(uuid, date, bigint) from public","revoke all on function public.record_cash_movement(uuid, public.cash_movement_type, bigint, text, uuid) from public","revoke all on function public.count_cash(uuid, bigint, text) from public","revoke all on function public.close_cash_period(uuid) from public","grant execute on function public.request_period_reopening(uuid, date, text) to authenticated","grant execute on function public.approve_period_reopening(uuid) to authenticated","grant execute on function public.create_financial_adjustment(uuid, text, uuid, bigint, text, uuid) to authenticated","grant execute on function public.create_financial_reversal(uuid, text, uuid, text, uuid) to authenticated","grant execute on function public.create_cash_register(uuid, text) to authenticated","grant execute on function public.open_cash_period(uuid, date, bigint) to authenticated","grant execute on function public.record_cash_movement(uuid, public.cash_movement_type, bigint, text, uuid) to authenticated","grant execute on function public.count_cash(uuid, bigint, text) to authenticated","grant execute on function public.close_cash_period(uuid) to authenticated"}	domain_completion
0005	{"create or replace function public.record_cash_movement(\n  p_cash_period_id uuid,\n  p_movement_type public.cash_movement_type,\n  p_amount_cents bigint,\n  p_reason text,\n  p_idempotency_key uuid\n) returns public.physical_cash_movements\nlanguage plpgsql security definer set search_path = public as $$\ndeclare actor uuid := public.require_authenticated(); period_row public.physical_cash_periods; register_row public.physical_cash_registers; movement public.physical_cash_movements; expected_balance bigint;\nbegin\n  select * into period_row from public.physical_cash_periods p where p.id = p_cash_period_id for update;\n  select * into register_row from public.physical_cash_registers r where r.id = period_row.cash_register_id;\n  if period_row.id is null then raise exception 'cash_period_not_found'; end if;\n  if period_row.status <> 'open' then raise exception 'cash_period_not_open'; end if;\n  if not public.has_congregation_role(register_row.congregation_id, array['treasurer', 'congregation_admin', 'central_admin']::public.app_role[]) then raise exception 'cash_movement_not_allowed'; end if;\n  if p_amount_cents is null or p_amount_cents <= 0 then raise exception 'cash_amount_invalid'; end if;\n  if p_reason is null or btrim(p_reason) = '' then raise exception 'cash_reason_required'; end if;\n  if p_idempotency_key is null then raise exception 'cash_idempotency_key_required'; end if;\n  if public.period_is_closed(register_row.congregation_id, period_row.reference_period) then raise exception 'closed_period_requires_reopening'; end if;\n  select period_row.opening_balance_cents + coalesce(sum(case when movement_type = 'cash_in' then amount_cents else -amount_cents end), 0)\n  into expected_balance\n  from public.physical_cash_movements\n  where cash_period_id = p_cash_period_id;\n  if p_movement_type <> 'cash_in' and expected_balance < p_amount_cents then\n    raise exception 'cash_insufficient_balance';\n  end if;\n  insert into public.physical_cash_movements (cash_period_id, movement_type, amount_cents, reason, created_by, idempotency_key)\n  values (p_cash_period_id, p_movement_type, p_amount_cents, p_reason, actor, p_idempotency_key)\n  on conflict (created_by, idempotency_key) do nothing returning * into movement;\n  if movement.id is null then select * into movement from public.physical_cash_movements where created_by = actor and idempotency_key = p_idempotency_key; return movement; end if;\n  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason) values (actor, register_row.congregation_id, 'created', 'physical_cash_movements', movement.id, to_jsonb(movement), p_reason);\n  return movement;\nend;\n$$","create or replace function public.count_cash(\n  p_cash_period_id uuid,\n  p_counted_balance_cents bigint,\n  p_divergence_reason text default null\n) returns public.physical_cash_periods\nlanguage plpgsql security definer set search_path = public as $$\ndeclare actor uuid := public.require_authenticated(); period_row public.physical_cash_periods; register_row public.physical_cash_registers; updated_period public.physical_cash_periods; expected_balance bigint;\nbegin\n  select * into period_row from public.physical_cash_periods p where p.id = p_cash_period_id for update;\n  select * into register_row from public.physical_cash_registers r where r.id = period_row.cash_register_id;\n  if period_row.id is null then raise exception 'cash_period_not_found'; end if;\n  if period_row.status <> 'open' then raise exception 'cash_period_not_open'; end if;\n  if not public.has_congregation_role(register_row.congregation_id, array['treasurer', 'congregation_admin', 'central_admin']::public.app_role[]) then raise exception 'cash_count_not_allowed'; end if;\n  if p_counted_balance_cents is null or p_counted_balance_cents < 0 then raise exception 'cash_count_invalid'; end if;\n  select period_row.opening_balance_cents + coalesce(sum(case when movement_type = 'cash_in' then amount_cents else -amount_cents end), 0)\n  into expected_balance from public.physical_cash_movements where cash_period_id = p_cash_period_id;\n  if p_counted_balance_cents <> expected_balance and (p_divergence_reason is null or btrim(p_divergence_reason) = '') then raise exception 'cash_divergence_reason_required'; end if;\n  update public.physical_cash_periods set counted_balance_cents = p_counted_balance_cents, counted_by = actor, counted_at = now(), divergence_reason = p_divergence_reason where id = p_cash_period_id returning * into updated_period;\n  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason) values (actor, register_row.congregation_id, 'counted', 'physical_cash_periods', period_row.id, to_jsonb(period_row), to_jsonb(updated_period), coalesce(p_divergence_reason, 'cash_counted'));\n  return updated_period;\nend;\n$$","create or replace function public.close_cash_period(\n  p_cash_period_id uuid\n) returns public.physical_cash_periods\nlanguage plpgsql security definer set search_path = public as $$\ndeclare actor uuid := public.require_authenticated(); period_row public.physical_cash_periods; register_row public.physical_cash_registers; closed_period public.physical_cash_periods;\nbegin\n  select * into period_row from public.physical_cash_periods p where p.id = p_cash_period_id for update;\n  select * into register_row from public.physical_cash_registers r where r.id = period_row.cash_register_id;\n  if period_row.id is null then raise exception 'cash_period_not_found'; end if;\n  if not public.has_congregation_role(register_row.congregation_id, array['congregation_admin', 'central_admin']::public.app_role[]) then raise exception 'cash_close_not_allowed'; end if;\n  if period_row.status <> 'open' then raise exception 'cash_period_not_open'; end if;\n  if period_row.counted_balance_cents is null then raise exception 'cash_count_required'; end if;\n  update public.physical_cash_periods set status = 'closed', closed_by = actor, closed_at = now() where id = p_cash_period_id returning * into closed_period;\n  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason) values (actor, register_row.congregation_id, 'closed', 'physical_cash_periods', period_row.id, to_jsonb(period_row), to_jsonb(closed_period), 'cash_period_closed');\n  return closed_period;\nend;\n$$"}	domain_completion_fix
0006	{"create or replace function public.record_cash_movement(\n  p_cash_period_id uuid,\n  p_movement_type public.cash_movement_type,\n  p_amount_cents bigint,\n  p_reason text,\n  p_idempotency_key uuid\n) returns public.physical_cash_movements\nlanguage plpgsql security definer set search_path = public as $$\ndeclare actor uuid := public.require_authenticated(); period_row public.physical_cash_periods; register_row public.physical_cash_registers; movement public.physical_cash_movements; expected_balance bigint;\nbegin\n  select * into period_row from public.physical_cash_periods p where p.id = p_cash_period_id for update;\n  select * into register_row from public.physical_cash_registers r where r.id = period_row.cash_register_id;\n  if period_row.id is null then raise exception 'cash_period_not_found'; end if;\n  if period_row.status <> 'open' then raise exception 'cash_period_not_open'; end if;\n  if not public.has_congregation_role(register_row.congregation_id, array['treasurer', 'congregation_admin', 'central_admin']::public.app_role[]) then raise exception 'cash_movement_not_allowed'; end if;\n  if p_amount_cents is null or p_amount_cents <= 0 then raise exception 'cash_amount_invalid'; end if;\n  if p_reason is null or btrim(p_reason) = '' then raise exception 'cash_reason_required'; end if;\n  if p_idempotency_key is null then raise exception 'cash_idempotency_key_required'; end if;\n  if public.period_is_closed(register_row.congregation_id, period_row.reference_period) then raise exception 'closed_period_requires_reopening'; end if;\n  select * into movement\n  from public.physical_cash_movements\n  where created_by = actor and idempotency_key = p_idempotency_key;\n  if movement.id is not null then return movement; end if;\n  select period_row.opening_balance_cents + coalesce(sum(case when movement_type = 'cash_in' then amount_cents else -amount_cents end), 0)\n  into expected_balance\n  from public.physical_cash_movements\n  where cash_period_id = p_cash_period_id;\n  if p_movement_type <> 'cash_in' and expected_balance < p_amount_cents then\n    raise exception 'cash_insufficient_balance';\n  end if;\n  insert into public.physical_cash_movements (cash_period_id, movement_type, amount_cents, reason, created_by, idempotency_key)\n  values (p_cash_period_id, p_movement_type, p_amount_cents, p_reason, actor, p_idempotency_key)\n  on conflict (created_by, idempotency_key) do nothing returning * into movement;\n  if movement.id is null then select * into movement from public.physical_cash_movements where created_by = actor and idempotency_key = p_idempotency_key; return movement; end if;\n  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason) values (actor, register_row.congregation_id, 'created', 'physical_cash_movements', movement.id, to_jsonb(movement), p_reason);\n  return movement;\nend;\n$$"}	cash_movement_idempotency_fix
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 128, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_realtime_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: mfa_recovery_code_sets mfa_recovery_code_sets_mfa_factor_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_recovery_code_sets
    ADD CONSTRAINT mfa_recovery_code_sets_mfa_factor_id_key UNIQUE (mfa_factor_id);


--
-- Name: mfa_recovery_code_sets mfa_recovery_code_sets_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_recovery_code_sets
    ADD CONSTRAINT mfa_recovery_code_sets_pkey PRIMARY KEY (id);


--
-- Name: mfa_recovery_code_sets mfa_recovery_code_sets_user_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_recovery_code_sets
    ADD CONSTRAINT mfa_recovery_code_sets_user_id_key UNIQUE (user_id);


--
-- Name: mfa_recovery_codes mfa_recovery_codes_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_recovery_codes
    ADD CONSTRAINT mfa_recovery_codes_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: scim_tokens scim_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.scim_tokens
    ADD CONSTRAINT scim_tokens_pkey PRIMARY KEY (id);


--
-- Name: scim_users scim_users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.scim_users
    ADD CONSTRAINT scim_users_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: audit_events audit_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_events
    ADD CONSTRAINT audit_events_pkey PRIMARY KEY (id);


--
-- Name: congregations congregations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.congregations
    ADD CONSTRAINT congregations_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: entries entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entries
    ADD CONSTRAINT entries_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: financial_adjustments financial_adjustments_created_by_idempotency_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_adjustments
    ADD CONSTRAINT financial_adjustments_created_by_idempotency_key_key UNIQUE (created_by, idempotency_key);


--
-- Name: financial_adjustments financial_adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_adjustments
    ADD CONSTRAINT financial_adjustments_pkey PRIMARY KEY (id);


--
-- Name: financial_reversals financial_reversals_created_by_idempotency_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_reversals
    ADD CONSTRAINT financial_reversals_created_by_idempotency_key_key UNIQUE (created_by, idempotency_key);


--
-- Name: financial_reversals financial_reversals_entity_type_entity_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_reversals
    ADD CONSTRAINT financial_reversals_entity_type_entity_id_key UNIQUE (entity_type, entity_id);


--
-- Name: financial_reversals financial_reversals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_reversals
    ADD CONSTRAINT financial_reversals_pkey PRIMARY KEY (id);


--
-- Name: headquarters_transfers headquarters_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.headquarters_transfers
    ADD CONSTRAINT headquarters_transfers_pkey PRIMARY KEY (id);


--
-- Name: membership_permission_overrides membership_permission_overrides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_permission_overrides
    ADD CONSTRAINT membership_permission_overrides_pkey PRIMARY KEY (user_id, congregation_id);


--
-- Name: memberships memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY (user_id, congregation_id);


--
-- Name: monthly_closings monthly_closings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monthly_closings
    ADD CONSTRAINT monthly_closings_pkey PRIMARY KEY (congregation_id, reference_period);


--
-- Name: period_reopening_requests period_reopening_requests_id_congregation_id_reference_peri_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.period_reopening_requests
    ADD CONSTRAINT period_reopening_requests_id_congregation_id_reference_peri_key UNIQUE (id, congregation_id, reference_period);


--
-- Name: period_reopening_requests period_reopening_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.period_reopening_requests
    ADD CONSTRAINT period_reopening_requests_pkey PRIMARY KEY (id);


--
-- Name: physical_cash_movements physical_cash_movements_created_by_idempotency_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_cash_movements
    ADD CONSTRAINT physical_cash_movements_created_by_idempotency_key_key UNIQUE (created_by, idempotency_key);


--
-- Name: physical_cash_movements physical_cash_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_cash_movements
    ADD CONSTRAINT physical_cash_movements_pkey PRIMARY KEY (id);


--
-- Name: physical_cash_periods physical_cash_periods_cash_register_id_reference_period_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_cash_periods
    ADD CONSTRAINT physical_cash_periods_cash_register_id_reference_period_key UNIQUE (cash_register_id, reference_period);


--
-- Name: physical_cash_periods physical_cash_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_cash_periods
    ADD CONSTRAINT physical_cash_periods_pkey PRIMARY KEY (id);


--
-- Name: physical_cash_registers physical_cash_registers_congregation_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_cash_registers
    ADD CONSTRAINT physical_cash_registers_congregation_id_name_key UNIQUE (congregation_id, name);


--
-- Name: physical_cash_registers physical_cash_registers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_cash_registers
    ADD CONSTRAINT physical_cash_registers_pkey PRIMARY KEY (id);


--
-- Name: messages messages_payload_exclusive; Type: CHECK CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages
    ADD CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL))) NOT VALID;


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: idx_users_created_at_desc; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_created_at_desc ON auth.users USING btree (created_at DESC);


--
-- Name: idx_users_email; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_email ON auth.users USING btree (email);


--
-- Name: idx_users_last_sign_in_at_desc; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_last_sign_in_at_desc ON auth.users USING btree (last_sign_in_at DESC);


--
-- Name: idx_users_name; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_name ON auth.users USING btree (((raw_user_meta_data ->> 'name'::text))) WHERE ((raw_user_meta_data ->> 'name'::text) IS NOT NULL);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: mfa_recovery_codes_set_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_recovery_codes_set_id_idx ON auth.mfa_recovery_codes USING btree (mfa_recovery_code_set_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: scim_tokens_expires_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX scim_tokens_expires_at_idx ON auth.scim_tokens USING btree (expires_at);


--
-- Name: scim_tokens_revoked_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX scim_tokens_revoked_at_idx ON auth.scim_tokens USING btree (revoked_at);


--
-- Name: scim_tokens_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX scim_tokens_sso_provider_id_idx ON auth.scim_tokens USING btree (sso_provider_id);


--
-- Name: scim_tokens_token_hash_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX scim_tokens_token_hash_key ON auth.scim_tokens USING btree (token_hash);


--
-- Name: scim_users_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX scim_users_created_at_idx ON auth.scim_users USING btree (sso_provider_id, created_at, id) WHERE (deleted_at IS NULL);


--
-- Name: scim_users_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX scim_users_deleted_at_idx ON auth.scim_users USING btree (deleted_at);


--
-- Name: scim_users_external_id_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX scim_users_external_id_key ON auth.scim_users USING btree (sso_provider_id, external_id) WHERE ((external_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: scim_users_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX scim_users_id_idx ON auth.scim_users USING btree (sso_provider_id, id) WHERE (deleted_at IS NULL);


--
-- Name: scim_users_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX scim_users_sso_provider_id_idx ON auth.scim_users USING btree (sso_provider_id);


--
-- Name: scim_users_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX scim_users_updated_at_idx ON auth.scim_users USING btree (sso_provider_id, updated_at, id) WHERE (deleted_at IS NULL);


--
-- Name: scim_users_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX scim_users_user_id_idx ON auth.scim_users USING btree (user_id);


--
-- Name: scim_users_user_name_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX scim_users_user_name_idx ON auth.scim_users USING btree (sso_provider_id, user_name COLLATE "C", id) WHERE (deleted_at IS NULL);


--
-- Name: scim_users_user_name_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX scim_users_user_name_key ON auth.scim_users USING btree (sso_provider_id, user_name) WHERE (deleted_at IS NULL);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at);


--
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id);


--
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id);


--
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id);


--
-- Name: congregations_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX congregations_parent_id_idx ON public.congregations USING btree (parent_id);


--
-- Name: documents_entity_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX documents_entity_idx ON public.documents USING btree (entity_type, entity_id);


--
-- Name: financial_adjustments_entity_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX financial_adjustments_entity_idx ON public.financial_adjustments USING btree (entity_type, entity_id);


--
-- Name: financial_adjustments_period_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX financial_adjustments_period_idx ON public.financial_adjustments USING btree (congregation_id, reference_period);


--
-- Name: financial_reversals_period_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX financial_reversals_period_idx ON public.financial_reversals USING btree (congregation_id, reference_period);


--
-- Name: monthly_closings_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX monthly_closings_id_idx ON public.monthly_closings USING btree (id);


--
-- Name: period_reopening_pending_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX period_reopening_pending_idx ON public.period_reopening_requests USING btree (congregation_id, reference_period) WHERE (status = 'pending'::public.reopening_status);


--
-- Name: physical_cash_movements_period_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX physical_cash_movements_period_idx ON public.physical_cash_movements USING btree (cash_period_id, created_at);


--
-- Name: physical_cash_periods_reference_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX physical_cash_periods_reference_idx ON public.physical_cash_periods USING btree (cash_register_id, reference_period);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_selec; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_selec ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter, COALESCE(selected_columns, '{}'::text[]));


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: idx_objects_current_version; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_objects_current_version ON storage.objects USING btree (bucket_id, name COLLATE "C") WHERE (archived_at IS NULL);


--
-- Name: idx_objects_delete_markers; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_delete_markers ON storage.objects USING btree (bucket_id, name COLLATE "C") WHERE is_delete_marker;


--
-- Name: idx_objects_null_version; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_objects_null_version ON storage.objects USING btree (bucket_id, name COLLATE "C") WHERE (NOT is_versioned);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_name_version_key; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX objects_bucket_id_name_version_key ON storage.objects USING btree (bucket_id, name COLLATE "C", version) NULLS NOT DISTINCT;


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: entries entries_audit_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER entries_audit_insert AFTER INSERT ON public.entries FOR EACH ROW EXECUTE FUNCTION public.audit_financial_insert();


--
-- Name: entries entries_closed_period_guard; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER entries_closed_period_guard BEFORE INSERT OR DELETE OR UPDATE ON public.entries FOR EACH ROW EXECUTE FUNCTION public.prevent_closed_period_changes();


--
-- Name: expenses expenses_audit_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER expenses_audit_insert AFTER INSERT ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.audit_financial_insert();


--
-- Name: expenses expenses_closed_period_guard; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER expenses_closed_period_guard BEFORE INSERT OR DELETE OR UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.prevent_closed_period_changes();


--
-- Name: headquarters_transfers transfers_audit_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER transfers_audit_insert AFTER INSERT ON public.headquarters_transfers FOR EACH ROW EXECUTE FUNCTION public.audit_financial_insert();


--
-- Name: headquarters_transfers transfers_closed_period_guard; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER transfers_closed_period_guard BEFORE INSERT OR DELETE OR UPDATE ON public.headquarters_transfers FOR EACH ROW EXECUTE FUNCTION public.prevent_closed_period_changes();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_bucket_control_insert; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_bucket_control_insert BEFORE INSERT ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.protect_bucket_control_columns('service_role');


--
-- Name: buckets protect_bucket_control_update; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_bucket_control_update BEFORE UPDATE OF lifecycle_configuration, lifecycle_configuration_generation ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.protect_bucket_control_columns();


--
-- Name: buckets protect_bucket_control_update_role; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_bucket_control_update_role AFTER UPDATE OF lifecycle_configuration, lifecycle_configuration_generation ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_lifecycle_service_role('service_role');


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_recovery_code_sets mfa_recovery_code_sets_mfa_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_recovery_code_sets
    ADD CONSTRAINT mfa_recovery_code_sets_mfa_factor_id_fkey FOREIGN KEY (mfa_factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_recovery_code_sets mfa_recovery_code_sets_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_recovery_code_sets
    ADD CONSTRAINT mfa_recovery_code_sets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_recovery_codes mfa_recovery_codes_mfa_recovery_code_set_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_recovery_codes
    ADD CONSTRAINT mfa_recovery_codes_mfa_recovery_code_set_id_fkey FOREIGN KEY (mfa_recovery_code_set_id) REFERENCES auth.mfa_recovery_code_sets(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: scim_tokens scim_tokens_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.scim_tokens
    ADD CONSTRAINT scim_tokens_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: scim_users scim_users_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.scim_users
    ADD CONSTRAINT scim_users_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: scim_users scim_users_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.scim_users
    ADD CONSTRAINT scim_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: audit_events audit_events_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_events
    ADD CONSTRAINT audit_events_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id);


--
-- Name: audit_events audit_events_congregation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_events
    ADD CONSTRAINT audit_events_congregation_id_fkey FOREIGN KEY (congregation_id) REFERENCES public.congregations(id);


--
-- Name: congregations congregations_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.congregations
    ADD CONSTRAINT congregations_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.congregations(id);


--
-- Name: documents documents_congregation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_congregation_id_fkey FOREIGN KEY (congregation_id) REFERENCES public.congregations(id);


--
-- Name: documents documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id);


--
-- Name: entries entries_congregation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entries
    ADD CONSTRAINT entries_congregation_id_fkey FOREIGN KEY (congregation_id) REFERENCES public.congregations(id);


--
-- Name: entries entries_recorded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entries
    ADD CONSTRAINT entries_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES auth.users(id);


--
-- Name: expenses expenses_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id);


--
-- Name: expenses expenses_congregation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_congregation_id_fkey FOREIGN KEY (congregation_id) REFERENCES public.congregations(id);


--
-- Name: expenses expenses_recorded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES auth.users(id);


--
-- Name: financial_adjustments financial_adjustments_congregation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_adjustments
    ADD CONSTRAINT financial_adjustments_congregation_id_fkey FOREIGN KEY (congregation_id) REFERENCES public.congregations(id);


--
-- Name: financial_adjustments financial_adjustments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_adjustments
    ADD CONSTRAINT financial_adjustments_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: financial_reversals financial_reversals_congregation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_reversals
    ADD CONSTRAINT financial_reversals_congregation_id_fkey FOREIGN KEY (congregation_id) REFERENCES public.congregations(id);


--
-- Name: financial_reversals financial_reversals_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_reversals
    ADD CONSTRAINT financial_reversals_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: headquarters_transfers headquarters_transfers_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.headquarters_transfers
    ADD CONSTRAINT headquarters_transfers_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id);


--
-- Name: headquarters_transfers headquarters_transfers_origin_congregation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.headquarters_transfers
    ADD CONSTRAINT headquarters_transfers_origin_congregation_id_fkey FOREIGN KEY (origin_congregation_id) REFERENCES public.congregations(id);


--
-- Name: headquarters_transfers headquarters_transfers_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.headquarters_transfers
    ADD CONSTRAINT headquarters_transfers_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES auth.users(id);


--
-- Name: membership_permission_overrides membership_permission_overrides_user_id_congregation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_permission_overrides
    ADD CONSTRAINT membership_permission_overrides_user_id_congregation_id_fkey FOREIGN KEY (user_id, congregation_id) REFERENCES public.memberships(user_id, congregation_id) ON DELETE CASCADE;


--
-- Name: memberships memberships_congregation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_congregation_id_fkey FOREIGN KEY (congregation_id) REFERENCES public.congregations(id) ON DELETE CASCADE;


--
-- Name: memberships memberships_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: monthly_closings monthly_closings_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monthly_closings
    ADD CONSTRAINT monthly_closings_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id);


--
-- Name: monthly_closings monthly_closings_congregation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monthly_closings
    ADD CONSTRAINT monthly_closings_congregation_id_fkey FOREIGN KEY (congregation_id) REFERENCES public.congregations(id);


--
-- Name: monthly_closings monthly_closings_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monthly_closings
    ADD CONSTRAINT monthly_closings_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES auth.users(id);


--
-- Name: period_reopening_requests period_reopening_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.period_reopening_requests
    ADD CONSTRAINT period_reopening_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id);


--
-- Name: period_reopening_requests period_reopening_requests_congregation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.period_reopening_requests
    ADD CONSTRAINT period_reopening_requests_congregation_id_fkey FOREIGN KEY (congregation_id) REFERENCES public.congregations(id);


--
-- Name: period_reopening_requests period_reopening_requests_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.period_reopening_requests
    ADD CONSTRAINT period_reopening_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES auth.users(id);


--
-- Name: physical_cash_movements physical_cash_movements_cash_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_cash_movements
    ADD CONSTRAINT physical_cash_movements_cash_period_id_fkey FOREIGN KEY (cash_period_id) REFERENCES public.physical_cash_periods(id);


--
-- Name: physical_cash_movements physical_cash_movements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_cash_movements
    ADD CONSTRAINT physical_cash_movements_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: physical_cash_periods physical_cash_periods_cash_register_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_cash_periods
    ADD CONSTRAINT physical_cash_periods_cash_register_id_fkey FOREIGN KEY (cash_register_id) REFERENCES public.physical_cash_registers(id);


--
-- Name: physical_cash_periods physical_cash_periods_closed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_cash_periods
    ADD CONSTRAINT physical_cash_periods_closed_by_fkey FOREIGN KEY (closed_by) REFERENCES auth.users(id);


--
-- Name: physical_cash_periods physical_cash_periods_counted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_cash_periods
    ADD CONSTRAINT physical_cash_periods_counted_by_fkey FOREIGN KEY (counted_by) REFERENCES auth.users(id);


--
-- Name: physical_cash_periods physical_cash_periods_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_cash_periods
    ADD CONSTRAINT physical_cash_periods_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: physical_cash_registers physical_cash_registers_congregation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_cash_registers
    ADD CONSTRAINT physical_cash_registers_congregation_id_fkey FOREIGN KEY (congregation_id) REFERENCES public.congregations(id);


--
-- Name: physical_cash_registers physical_cash_registers_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_cash_registers
    ADD CONSTRAINT physical_cash_registers_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

--
-- Name: congregations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.congregations ENABLE ROW LEVEL SECURITY;

--
-- Name: documents; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

--
-- Name: entries; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

--
-- Name: expenses; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

--
-- Name: entries finance roles can create entries; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "finance roles can create entries" ON public.entries FOR INSERT WITH CHECK (((recorded_by = auth.uid()) AND public.has_congregation_permission(congregation_id, 'financial.write'::text)));


--
-- Name: expenses finance roles can create expenses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "finance roles can create expenses" ON public.expenses FOR INSERT WITH CHECK (((recorded_by = auth.uid()) AND public.has_congregation_permission(congregation_id, 'financial.write'::text)));


--
-- Name: headquarters_transfers finance roles can create transfers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "finance roles can create transfers" ON public.headquarters_transfers FOR INSERT WITH CHECK (((requested_by = auth.uid()) AND public.has_congregation_permission(origin_congregation_id, 'financial.write'::text)));


--
-- Name: documents finance roles can upload documents; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "finance roles can upload documents" ON public.documents FOR INSERT WITH CHECK (((uploaded_by = auth.uid()) AND public.has_congregation_permission(congregation_id, 'financial.write'::text)));


--
-- Name: financial_adjustments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.financial_adjustments ENABLE ROW LEVEL SECURITY;

--
-- Name: financial_reversals; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.financial_reversals ENABLE ROW LEVEL SECURITY;

--
-- Name: headquarters_transfers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.headquarters_transfers ENABLE ROW LEVEL SECURITY;

--
-- Name: financial_adjustments members can read adjustments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "members can read adjustments" ON public.financial_adjustments FOR SELECT USING (public.is_congregation_member(congregation_id));


--
-- Name: physical_cash_movements members can read cash movements; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "members can read cash movements" ON public.physical_cash_movements FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.physical_cash_periods p
     JOIN public.physical_cash_registers r ON ((r.id = p.cash_register_id)))
  WHERE ((p.id = physical_cash_movements.cash_period_id) AND public.is_congregation_member(r.congregation_id)))));


--
-- Name: physical_cash_periods members can read cash periods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "members can read cash periods" ON public.physical_cash_periods FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.physical_cash_registers r
  WHERE ((r.id = physical_cash_periods.cash_register_id) AND public.is_congregation_member(r.congregation_id)))));


--
-- Name: physical_cash_registers members can read cash registers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "members can read cash registers" ON public.physical_cash_registers FOR SELECT USING (public.is_congregation_member(congregation_id));


--
-- Name: documents members can read linked documents; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "members can read linked documents" ON public.documents FOR SELECT USING (public.is_congregation_member(congregation_id));


--
-- Name: period_reopening_requests members can read reopening requests; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "members can read reopening requests" ON public.period_reopening_requests FOR SELECT USING (public.is_congregation_member(congregation_id));


--
-- Name: financial_reversals members can read reversals; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "members can read reversals" ON public.financial_reversals FOR SELECT USING (public.is_congregation_member(congregation_id));


--
-- Name: audit_events members can read their audit events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "members can read their audit events" ON public.audit_events FOR SELECT USING (((congregation_id IS NOT NULL) AND public.has_congregation_permission(congregation_id, 'audit.read'::text)));


--
-- Name: monthly_closings members can read their closings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "members can read their closings" ON public.monthly_closings FOR SELECT USING (public.is_congregation_member(congregation_id));


--
-- Name: congregations members can read their congregations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "members can read their congregations" ON public.congregations FOR SELECT USING (public.is_congregation_member(id));


--
-- Name: entries members can read their entries; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "members can read their entries" ON public.entries FOR SELECT USING (public.is_congregation_member(congregation_id));


--
-- Name: expenses members can read their expenses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "members can read their expenses" ON public.expenses FOR SELECT USING (public.is_congregation_member(congregation_id));


--
-- Name: headquarters_transfers members can read their transfers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "members can read their transfers" ON public.headquarters_transfers FOR SELECT USING (public.is_congregation_member(origin_congregation_id));


--
-- Name: membership_permission_overrides; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.membership_permission_overrides ENABLE ROW LEVEL SECURITY;

--
-- Name: memberships; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

--
-- Name: monthly_closings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.monthly_closings ENABLE ROW LEVEL SECURITY;

--
-- Name: period_reopening_requests; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.period_reopening_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: physical_cash_movements; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.physical_cash_movements ENABLE ROW LEVEL SECURITY;

--
-- Name: physical_cash_periods; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.physical_cash_periods ENABLE ROW LEVEL SECURITY;

--
-- Name: physical_cash_registers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.physical_cash_registers ENABLE ROW LEVEL SECURITY;

--
-- Name: memberships users can read their memberships; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "users can read their memberships" ON public.memberships FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: membership_permission_overrides users can read their permission overrides; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "users can read their permission overrides" ON public.membership_permission_overrides FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;
GRANT USAGE ON SCHEMA realtime TO authenticated;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION pg_reload_conf(); Type: ACL; Schema: pg_catalog; Owner: supabase_admin
--

GRANT ALL ON FUNCTION pg_catalog.pg_reload_conf() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;


--
-- Name: TABLE congregations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.congregations TO anon;
GRANT ALL ON TABLE public.congregations TO authenticated;
GRANT ALL ON TABLE public.congregations TO service_role;


--
-- Name: FUNCTION admin_create_congregation(p_actor_id uuid, p_name text, p_city text, p_state text, p_organization_type text, p_is_headquarters boolean, p_parent_id uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.admin_create_congregation(p_actor_id uuid, p_name text, p_city text, p_state text, p_organization_type text, p_is_headquarters boolean, p_parent_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.admin_create_congregation(p_actor_id uuid, p_name text, p_city text, p_state text, p_organization_type text, p_is_headquarters boolean, p_parent_id uuid) TO service_role;


--
-- Name: FUNCTION admin_create_congregation(p_actor_id uuid, p_name text, p_city text, p_state text, p_organization_type text, p_is_headquarters boolean, p_parent_id uuid, p_organization_level public.congregation_level); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.admin_create_congregation(p_actor_id uuid, p_name text, p_city text, p_state text, p_organization_type text, p_is_headquarters boolean, p_parent_id uuid, p_organization_level public.congregation_level) FROM PUBLIC;
GRANT ALL ON FUNCTION public.admin_create_congregation(p_actor_id uuid, p_name text, p_city text, p_state text, p_organization_type text, p_is_headquarters boolean, p_parent_id uuid, p_organization_level public.congregation_level) TO service_role;


--
-- Name: FUNCTION admin_replace_user_access(p_actor_id uuid, p_user_id uuid, p_assignments jsonb); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.admin_replace_user_access(p_actor_id uuid, p_user_id uuid, p_assignments jsonb) FROM PUBLIC;
GRANT ALL ON FUNCTION public.admin_replace_user_access(p_actor_id uuid, p_user_id uuid, p_assignments jsonb) TO service_role;


--
-- Name: TABLE expenses; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.expenses TO anon;
GRANT ALL ON TABLE public.expenses TO authenticated;
GRANT ALL ON TABLE public.expenses TO service_role;


--
-- Name: FUNCTION approve_expense(p_expense_id uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.approve_expense(p_expense_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.approve_expense(p_expense_id uuid) TO anon;
GRANT ALL ON FUNCTION public.approve_expense(p_expense_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.approve_expense(p_expense_id uuid) TO service_role;


--
-- Name: TABLE period_reopening_requests; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.period_reopening_requests TO anon;
GRANT ALL ON TABLE public.period_reopening_requests TO authenticated;
GRANT ALL ON TABLE public.period_reopening_requests TO service_role;


--
-- Name: FUNCTION approve_period_reopening(p_request_id uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.approve_period_reopening(p_request_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.approve_period_reopening(p_request_id uuid) TO anon;
GRANT ALL ON FUNCTION public.approve_period_reopening(p_request_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.approve_period_reopening(p_request_id uuid) TO service_role;


--
-- Name: TABLE headquarters_transfers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.headquarters_transfers TO anon;
GRANT ALL ON TABLE public.headquarters_transfers TO authenticated;
GRANT ALL ON TABLE public.headquarters_transfers TO service_role;


--
-- Name: FUNCTION approve_transfer(p_transfer_id uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.approve_transfer(p_transfer_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.approve_transfer(p_transfer_id uuid) TO anon;
GRANT ALL ON FUNCTION public.approve_transfer(p_transfer_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.approve_transfer(p_transfer_id uuid) TO service_role;


--
-- Name: FUNCTION assert_equal(p_actual anyelement, p_expected anyelement, p_message text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.assert_equal(p_actual anyelement, p_expected anyelement, p_message text) TO anon;
GRANT ALL ON FUNCTION public.assert_equal(p_actual anyelement, p_expected anyelement, p_message text) TO authenticated;
GRANT ALL ON FUNCTION public.assert_equal(p_actual anyelement, p_expected anyelement, p_message text) TO service_role;


--
-- Name: FUNCTION assert_not_null(p_value anyelement, p_message text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.assert_not_null(p_value anyelement, p_message text) TO anon;
GRANT ALL ON FUNCTION public.assert_not_null(p_value anyelement, p_message text) TO authenticated;
GRANT ALL ON FUNCTION public.assert_not_null(p_value anyelement, p_message text) TO service_role;


--
-- Name: FUNCTION assert_true(p_condition boolean, p_message text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.assert_true(p_condition boolean, p_message text) TO anon;
GRANT ALL ON FUNCTION public.assert_true(p_condition boolean, p_message text) TO authenticated;
GRANT ALL ON FUNCTION public.assert_true(p_condition boolean, p_message text) TO service_role;


--
-- Name: FUNCTION audit_financial_insert(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.audit_financial_insert() TO anon;
GRANT ALL ON FUNCTION public.audit_financial_insert() TO authenticated;
GRANT ALL ON FUNCTION public.audit_financial_insert() TO service_role;


--
-- Name: TABLE physical_cash_periods; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.physical_cash_periods TO anon;
GRANT ALL ON TABLE public.physical_cash_periods TO authenticated;
GRANT ALL ON TABLE public.physical_cash_periods TO service_role;


--
-- Name: FUNCTION close_cash_period(p_cash_period_id uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.close_cash_period(p_cash_period_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.close_cash_period(p_cash_period_id uuid) TO anon;
GRANT ALL ON FUNCTION public.close_cash_period(p_cash_period_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.close_cash_period(p_cash_period_id uuid) TO service_role;


--
-- Name: TABLE monthly_closings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.monthly_closings TO anon;
GRANT ALL ON TABLE public.monthly_closings TO authenticated;
GRANT ALL ON TABLE public.monthly_closings TO service_role;


--
-- Name: FUNCTION close_monthly_period(p_congregation_id uuid, p_reference_period date); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.close_monthly_period(p_congregation_id uuid, p_reference_period date) FROM PUBLIC;
GRANT ALL ON FUNCTION public.close_monthly_period(p_congregation_id uuid, p_reference_period date) TO anon;
GRANT ALL ON FUNCTION public.close_monthly_period(p_congregation_id uuid, p_reference_period date) TO authenticated;
GRANT ALL ON FUNCTION public.close_monthly_period(p_congregation_id uuid, p_reference_period date) TO service_role;


--
-- Name: FUNCTION confirm_transfer(p_transfer_id uuid, p_amount_received_cents bigint); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.confirm_transfer(p_transfer_id uuid, p_amount_received_cents bigint) FROM PUBLIC;
GRANT ALL ON FUNCTION public.confirm_transfer(p_transfer_id uuid, p_amount_received_cents bigint) TO anon;
GRANT ALL ON FUNCTION public.confirm_transfer(p_transfer_id uuid, p_amount_received_cents bigint) TO authenticated;
GRANT ALL ON FUNCTION public.confirm_transfer(p_transfer_id uuid, p_amount_received_cents bigint) TO service_role;


--
-- Name: FUNCTION count_cash(p_cash_period_id uuid, p_counted_balance_cents bigint, p_divergence_reason text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.count_cash(p_cash_period_id uuid, p_counted_balance_cents bigint, p_divergence_reason text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.count_cash(p_cash_period_id uuid, p_counted_balance_cents bigint, p_divergence_reason text) TO anon;
GRANT ALL ON FUNCTION public.count_cash(p_cash_period_id uuid, p_counted_balance_cents bigint, p_divergence_reason text) TO authenticated;
GRANT ALL ON FUNCTION public.count_cash(p_cash_period_id uuid, p_counted_balance_cents bigint, p_divergence_reason text) TO service_role;


--
-- Name: TABLE physical_cash_registers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.physical_cash_registers TO anon;
GRANT ALL ON TABLE public.physical_cash_registers TO authenticated;
GRANT ALL ON TABLE public.physical_cash_registers TO service_role;


--
-- Name: FUNCTION create_cash_register(p_congregation_id uuid, p_name text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.create_cash_register(p_congregation_id uuid, p_name text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.create_cash_register(p_congregation_id uuid, p_name text) TO anon;
GRANT ALL ON FUNCTION public.create_cash_register(p_congregation_id uuid, p_name text) TO authenticated;
GRANT ALL ON FUNCTION public.create_cash_register(p_congregation_id uuid, p_name text) TO service_role;


--
-- Name: TABLE entries; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.entries TO anon;
GRANT ALL ON TABLE public.entries TO authenticated;
GRANT ALL ON TABLE public.entries TO service_role;


--
-- Name: FUNCTION create_entry(p_congregation_id uuid, p_occurred_on date, p_amount_cents bigint, p_category text, p_origin text, p_payment_method text, p_purpose text, p_is_internal_transfer boolean); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.create_entry(p_congregation_id uuid, p_occurred_on date, p_amount_cents bigint, p_category text, p_origin text, p_payment_method text, p_purpose text, p_is_internal_transfer boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION public.create_entry(p_congregation_id uuid, p_occurred_on date, p_amount_cents bigint, p_category text, p_origin text, p_payment_method text, p_purpose text, p_is_internal_transfer boolean) TO authenticated;
GRANT ALL ON FUNCTION public.create_entry(p_congregation_id uuid, p_occurred_on date, p_amount_cents bigint, p_category text, p_origin text, p_payment_method text, p_purpose text, p_is_internal_transfer boolean) TO service_role;


--
-- Name: FUNCTION create_expense(p_congregation_id uuid, p_occurred_on date, p_amount_cents bigint, p_category text, p_description text, p_vendor text, p_payment_method text, p_purpose text, p_cost_center text, p_is_internal_transfer boolean); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.create_expense(p_congregation_id uuid, p_occurred_on date, p_amount_cents bigint, p_category text, p_description text, p_vendor text, p_payment_method text, p_purpose text, p_cost_center text, p_is_internal_transfer boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION public.create_expense(p_congregation_id uuid, p_occurred_on date, p_amount_cents bigint, p_category text, p_description text, p_vendor text, p_payment_method text, p_purpose text, p_cost_center text, p_is_internal_transfer boolean) TO authenticated;
GRANT ALL ON FUNCTION public.create_expense(p_congregation_id uuid, p_occurred_on date, p_amount_cents bigint, p_category text, p_description text, p_vendor text, p_payment_method text, p_purpose text, p_cost_center text, p_is_internal_transfer boolean) TO service_role;


--
-- Name: TABLE financial_adjustments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.financial_adjustments TO anon;
GRANT ALL ON TABLE public.financial_adjustments TO authenticated;
GRANT ALL ON TABLE public.financial_adjustments TO service_role;


--
-- Name: FUNCTION create_financial_adjustment(p_congregation_id uuid, p_entity_type text, p_entity_id uuid, p_amount_cents bigint, p_reason text, p_idempotency_key uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.create_financial_adjustment(p_congregation_id uuid, p_entity_type text, p_entity_id uuid, p_amount_cents bigint, p_reason text, p_idempotency_key uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.create_financial_adjustment(p_congregation_id uuid, p_entity_type text, p_entity_id uuid, p_amount_cents bigint, p_reason text, p_idempotency_key uuid) TO anon;
GRANT ALL ON FUNCTION public.create_financial_adjustment(p_congregation_id uuid, p_entity_type text, p_entity_id uuid, p_amount_cents bigint, p_reason text, p_idempotency_key uuid) TO authenticated;
GRANT ALL ON FUNCTION public.create_financial_adjustment(p_congregation_id uuid, p_entity_type text, p_entity_id uuid, p_amount_cents bigint, p_reason text, p_idempotency_key uuid) TO service_role;


--
-- Name: TABLE financial_reversals; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.financial_reversals TO anon;
GRANT ALL ON TABLE public.financial_reversals TO authenticated;
GRANT ALL ON TABLE public.financial_reversals TO service_role;


--
-- Name: FUNCTION create_financial_reversal(p_congregation_id uuid, p_entity_type text, p_entity_id uuid, p_reason text, p_idempotency_key uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.create_financial_reversal(p_congregation_id uuid, p_entity_type text, p_entity_id uuid, p_reason text, p_idempotency_key uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.create_financial_reversal(p_congregation_id uuid, p_entity_type text, p_entity_id uuid, p_reason text, p_idempotency_key uuid) TO anon;
GRANT ALL ON FUNCTION public.create_financial_reversal(p_congregation_id uuid, p_entity_type text, p_entity_id uuid, p_reason text, p_idempotency_key uuid) TO authenticated;
GRANT ALL ON FUNCTION public.create_financial_reversal(p_congregation_id uuid, p_entity_type text, p_entity_id uuid, p_reason text, p_idempotency_key uuid) TO service_role;


--
-- Name: FUNCTION get_hierarchical_financial_metrics(p_user_id uuid, p_unit_id uuid, p_mode text, p_start_date date, p_end_date date); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.get_hierarchical_financial_metrics(p_user_id uuid, p_unit_id uuid, p_mode text, p_start_date date, p_end_date date) FROM PUBLIC;
GRANT ALL ON FUNCTION public.get_hierarchical_financial_metrics(p_user_id uuid, p_unit_id uuid, p_mode text, p_start_date date, p_end_date date) TO authenticated;
GRANT ALL ON FUNCTION public.get_hierarchical_financial_metrics(p_user_id uuid, p_unit_id uuid, p_mode text, p_start_date date, p_end_date date) TO service_role;


--
-- Name: FUNCTION has_congregation_permission(target_congregation uuid, target_permission text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.has_congregation_permission(target_congregation uuid, target_permission text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.has_congregation_permission(target_congregation uuid, target_permission text) TO anon;
GRANT ALL ON FUNCTION public.has_congregation_permission(target_congregation uuid, target_permission text) TO authenticated;
GRANT ALL ON FUNCTION public.has_congregation_permission(target_congregation uuid, target_permission text) TO service_role;


--
-- Name: FUNCTION has_congregation_role(target_congregation uuid, allowed_roles public.app_role[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.has_congregation_role(target_congregation uuid, allowed_roles public.app_role[]) TO anon;
GRANT ALL ON FUNCTION public.has_congregation_role(target_congregation uuid, allowed_roles public.app_role[]) TO authenticated;
GRANT ALL ON FUNCTION public.has_congregation_role(target_congregation uuid, allowed_roles public.app_role[]) TO service_role;


--
-- Name: FUNCTION is_congregation_member(target_congregation uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_congregation_member(target_congregation uuid) TO anon;
GRANT ALL ON FUNCTION public.is_congregation_member(target_congregation uuid) TO authenticated;
GRANT ALL ON FUNCTION public.is_congregation_member(target_congregation uuid) TO service_role;


--
-- Name: FUNCTION open_cash_period(p_cash_register_id uuid, p_reference_period date, p_opening_balance_cents bigint); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.open_cash_period(p_cash_register_id uuid, p_reference_period date, p_opening_balance_cents bigint) FROM PUBLIC;
GRANT ALL ON FUNCTION public.open_cash_period(p_cash_register_id uuid, p_reference_period date, p_opening_balance_cents bigint) TO anon;
GRANT ALL ON FUNCTION public.open_cash_period(p_cash_register_id uuid, p_reference_period date, p_opening_balance_cents bigint) TO authenticated;
GRANT ALL ON FUNCTION public.open_cash_period(p_cash_register_id uuid, p_reference_period date, p_opening_balance_cents bigint) TO service_role;


--
-- Name: FUNCTION period_is_closed(target_congregation uuid, target_period date); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.period_is_closed(target_congregation uuid, target_period date) TO anon;
GRANT ALL ON FUNCTION public.period_is_closed(target_congregation uuid, target_period date) TO authenticated;
GRANT ALL ON FUNCTION public.period_is_closed(target_congregation uuid, target_period date) TO service_role;


--
-- Name: FUNCTION prevent_closed_period_changes(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.prevent_closed_period_changes() TO anon;
GRANT ALL ON FUNCTION public.prevent_closed_period_changes() TO authenticated;
GRANT ALL ON FUNCTION public.prevent_closed_period_changes() TO service_role;


--
-- Name: TABLE physical_cash_movements; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.physical_cash_movements TO anon;
GRANT ALL ON TABLE public.physical_cash_movements TO authenticated;
GRANT ALL ON TABLE public.physical_cash_movements TO service_role;


--
-- Name: FUNCTION record_cash_movement(p_cash_period_id uuid, p_movement_type public.cash_movement_type, p_amount_cents bigint, p_reason text, p_idempotency_key uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.record_cash_movement(p_cash_period_id uuid, p_movement_type public.cash_movement_type, p_amount_cents bigint, p_reason text, p_idempotency_key uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.record_cash_movement(p_cash_period_id uuid, p_movement_type public.cash_movement_type, p_amount_cents bigint, p_reason text, p_idempotency_key uuid) TO anon;
GRANT ALL ON FUNCTION public.record_cash_movement(p_cash_period_id uuid, p_movement_type public.cash_movement_type, p_amount_cents bigint, p_reason text, p_idempotency_key uuid) TO authenticated;
GRANT ALL ON FUNCTION public.record_cash_movement(p_cash_period_id uuid, p_movement_type public.cash_movement_type, p_amount_cents bigint, p_reason text, p_idempotency_key uuid) TO service_role;


--
-- Name: FUNCTION request_period_reopening(p_congregation_id uuid, p_reference_period date, p_reason text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.request_period_reopening(p_congregation_id uuid, p_reference_period date, p_reason text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.request_period_reopening(p_congregation_id uuid, p_reference_period date, p_reason text) TO anon;
GRANT ALL ON FUNCTION public.request_period_reopening(p_congregation_id uuid, p_reference_period date, p_reason text) TO authenticated;
GRANT ALL ON FUNCTION public.request_period_reopening(p_congregation_id uuid, p_reference_period date, p_reason text) TO service_role;


--
-- Name: FUNCTION request_transfer(p_origin_congregation_id uuid, p_destination_name text, p_reference_period date, p_amount_sent_cents bigint, p_reason text, p_occurred_on date); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.request_transfer(p_origin_congregation_id uuid, p_destination_name text, p_reference_period date, p_amount_sent_cents bigint, p_reason text, p_occurred_on date) FROM PUBLIC;
GRANT ALL ON FUNCTION public.request_transfer(p_origin_congregation_id uuid, p_destination_name text, p_reference_period date, p_amount_sent_cents bigint, p_reason text, p_occurred_on date) TO anon;
GRANT ALL ON FUNCTION public.request_transfer(p_origin_congregation_id uuid, p_destination_name text, p_reference_period date, p_amount_sent_cents bigint, p_reason text, p_occurred_on date) TO authenticated;
GRANT ALL ON FUNCTION public.request_transfer(p_origin_congregation_id uuid, p_destination_name text, p_reference_period date, p_amount_sent_cents bigint, p_reason text, p_occurred_on date) TO service_role;


--
-- Name: FUNCTION require_authenticated(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.require_authenticated() FROM PUBLIC;
GRANT ALL ON FUNCTION public.require_authenticated() TO anon;
GRANT ALL ON FUNCTION public.require_authenticated() TO authenticated;
GRANT ALL ON FUNCTION public.require_authenticated() TO service_role;


--
-- Name: FUNCTION require_open_period(target_congregation uuid, target_period date); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.require_open_period(target_congregation uuid, target_period date) TO anon;
GRANT ALL ON FUNCTION public.require_open_period(target_congregation uuid, target_period date) TO authenticated;
GRANT ALL ON FUNCTION public.require_open_period(target_congregation uuid, target_period date) TO service_role;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;


--
-- Name: FUNCTION authorize(role_name text, topic_name text, claims text, sub text, headers text, read_extensions text[], write_extensions text[], OUT read_allowed boolean[], OUT write_allowed boolean[]); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.authorize(role_name text, topic_name text, claims text, sub text, headers text, read_extensions text[], write_extensions text[], OUT read_allowed boolean[], OUT write_allowed boolean[]) TO postgres;
GRANT ALL ON FUNCTION realtime.authorize(role_name text, topic_name text, claims text, sub text, headers text, read_extensions text[], write_extensions text[], OUT read_allowed boolean[], OUT write_allowed boolean[]) TO dashboard_user;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO service_role;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;


--
-- Name: FUNCTION list_changes_sync(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.list_changes_sync(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes_sync(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION send_binary(payload bytea, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION settled_changes(slot_name name, max_changes integer, VARIADIC opts text[]); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.settled_changes(slot_name name, max_changes integer, VARIADIC opts text[]) TO postgres;
GRANT ALL ON FUNCTION realtime.settled_changes(slot_name name, max_changes integer, VARIADIC opts text[]) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION wal2json_escape_identifier(name text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.wal2json_escape_identifier(name text) TO postgres;
GRANT ALL ON FUNCTION realtime.wal2json_escape_identifier(name text) TO dashboard_user;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE custom_oauth_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.custom_oauth_providers TO postgres;
GRANT ALL ON TABLE auth.custom_oauth_providers TO dashboard_user;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE mfa_recovery_code_sets; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.mfa_recovery_code_sets TO postgres;
GRANT ALL ON TABLE auth.mfa_recovery_code_sets TO dashboard_user;


--
-- Name: TABLE mfa_recovery_codes; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.mfa_recovery_codes TO postgres;
GRANT ALL ON TABLE auth.mfa_recovery_codes TO dashboard_user;


--
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;
GRANT ALL ON TABLE auth.oauth_authorizations TO dashboard_user;


--
-- Name: TABLE oauth_client_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_client_states TO postgres;
GRANT ALL ON TABLE auth.oauth_client_states TO dashboard_user;


--
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;
GRANT ALL ON TABLE auth.oauth_consents TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE scim_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.scim_tokens TO postgres;
GRANT ALL ON TABLE auth.scim_tokens TO dashboard_user;


--
-- Name: TABLE scim_users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.scim_users TO postgres;
GRANT ALL ON TABLE auth.scim_users TO dashboard_user;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE webauthn_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.webauthn_challenges TO postgres;
GRANT ALL ON TABLE auth.webauthn_challenges TO dashboard_user;


--
-- Name: TABLE webauthn_credentials; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.webauthn_credentials TO postgres;
GRANT ALL ON TABLE auth.webauthn_credentials TO dashboard_user;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE audit_events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.audit_events TO anon;
GRANT ALL ON TABLE public.audit_events TO authenticated;
GRANT ALL ON TABLE public.audit_events TO service_role;


--
-- Name: TABLE congregation_monthly_entry_categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.congregation_monthly_entry_categories TO anon;
GRANT ALL ON TABLE public.congregation_monthly_entry_categories TO authenticated;
GRANT ALL ON TABLE public.congregation_monthly_entry_categories TO service_role;


--
-- Name: TABLE congregation_monthly_summary; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.congregation_monthly_summary TO anon;
GRANT ALL ON TABLE public.congregation_monthly_summary TO authenticated;
GRANT ALL ON TABLE public.congregation_monthly_summary TO service_role;


--
-- Name: TABLE documents; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.documents TO anon;
GRANT ALL ON TABLE public.documents TO authenticated;
GRANT ALL ON TABLE public.documents TO service_role;


--
-- Name: TABLE membership_permission_overrides; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.membership_permission_overrides TO anon;
GRANT ALL ON TABLE public.membership_permission_overrides TO authenticated;
GRANT ALL ON TABLE public.membership_permission_overrides TO service_role;


--
-- Name: TABLE memberships; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.memberships TO anon;
GRANT ALL ON TABLE public.memberships TO authenticated;
GRANT ALL ON TABLE public.memberships TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE realtime.messages TO postgres;
GRANT SELECT,INSERT ON TABLE realtime.messages TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.buckets FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.buckets TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE storage.buckets TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE storage.buckets_analytics TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE buckets_vectors; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.buckets_vectors TO service_role;
GRANT SELECT ON TABLE storage.buckets_vectors TO anon;
GRANT SELECT ON TABLE storage.buckets_vectors TO authenticated;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.objects FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.objects TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE storage.objects TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE vector_indexes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.vector_indexes TO service_role;
GRANT SELECT ON TABLE storage.vector_indexes TO anon;
GRANT SELECT ON TABLE storage.vector_indexes TO authenticated;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT SELECT,INSERT ON TABLES TO postgres WITH GRANT OPTION;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

\unrestrict B1dcbFTGEdUmdSLUdmxOA6NVWGdjxnqQldcaj3KzRpN0kpaejmuTPCTRup84yG0

