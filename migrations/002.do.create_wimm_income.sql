CREATE TABLE wimm_income(
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    start_time NUMERIC NOT NULL,
    end_time  NUMERIC NOT NULL,
    hourly_payment  DECIMAL(12,2) NOT NULL,
    daily_extra  DECIMAL(12,2),
    date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id INTEGER REFERENCES wimm_user(id) ON DELETE CASCADE NOT NULL
);

