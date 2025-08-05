CREATE MIGRATION m1qyjm32b6dujni5n7w5rctxwp5nb65jrhmbcymkc3iowaghdoufhq
    ONTO m1ab7mhsdsakphbg3x6wr6kmbvkazxr6yfj5slb4q6hoo3kfuj7tbq
{
  DROP TYPE default::AuditLog;
  ALTER TYPE default::Device {
      ALTER LINK votes {
          RESET CARDINALITY;
      };
      ALTER PROPERTY name {
          RESET OPTIONALITY;
      };
  };
  DROP TYPE default::MealSettings;
  ALTER TYPE default::Vote {
      DROP LINK meal;
  };
  ALTER TYPE default::Meal {
      DROP PROPERTY start_time;
  };
  ALTER TYPE default::Meal RENAME TO default::MealPeriod;
  ALTER TYPE default::MealPeriod {
      CREATE REQUIRED PROPERTY created_at: std::datetime {
          SET default := (std::datetime_current());
      };
      ALTER PROPERTY end_time {
          SET TYPE std::cal::local_time USING (<std::cal::local_time>'00:00:00');
      };
      CREATE REQUIRED PROPERTY is_active: std::bool {
          SET default := true;
      };
      CREATE REQUIRED PROPERTY start_time: std::cal::local_time {
          SET REQUIRED USING (<std::cal::local_time>'00:00:00');
      };
  };
  DROP TYPE default::User;
};
