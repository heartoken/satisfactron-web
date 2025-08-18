CREATE MIGRATION m1nduywhh6vuz4klu4ia2yzxsimm7ie2ludzg4rka3ili5golbz5za
    ONTO m1hhes3xwucistja7qe7u6ck2rgshn5nrkb7ligjsaihnuk5uy7ftq
{
  ALTER TYPE default::Device {
      ALTER LINK votes {
          RESET CARDINALITY;
      };
      ALTER PROPERTY name {
          RESET OPTIONALITY;
      };
  };
  CREATE TYPE default::MealPeriod {
      CREATE REQUIRED PROPERTY created_at: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY end_time: std::cal::local_time;
      CREATE REQUIRED PROPERTY is_active: std::bool {
          SET default := true;
      };
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE REQUIRED PROPERTY start_time: std::cal::local_time;
  };
};
