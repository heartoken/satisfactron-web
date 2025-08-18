CREATE MIGRATION m1ab7mhsdsakphbg3x6wr6kmbvkazxr6yfj5slb4q6hoo3kfuj7tbq
    ONTO m1hhes3xwucistja7qe7u6ck2rgshn5nrkb7ligjsaihnuk5uy7ftq
{
  CREATE TYPE default::User {
      CREATE REQUIRED PROPERTY email: std::str;
      CREATE REQUIRED PROPERTY password_hash: std::str;
      CREATE REQUIRED PROPERTY role: std::str {
          CREATE CONSTRAINT std::one_of('admin', 'superuser', 'viewer');
      };
  };
  CREATE TYPE default::AuditLog {
      CREATE OPTIONAL LINK device: default::Device;
      CREATE OPTIONAL LINK user: default::User;
      CREATE REQUIRED PROPERTY action: std::str;
      CREATE REQUIRED PROPERTY timestamp: std::datetime {
          SET default := (std::datetime_current());
      };
  };
  CREATE TYPE default::Meal {
      CREATE REQUIRED PROPERTY end_time: std::datetime;
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE REQUIRED PROPERTY start_time: std::datetime;
  };
  CREATE TYPE default::MealSettings {
      CREATE REQUIRED LINK meal: default::Meal;
      CREATE REQUIRED PROPERTY is_active: std::bool;
      CREATE REQUIRED PROPERTY last_updated: std::datetime {
          SET default := (std::datetime_current());
      };
  };
  ALTER TYPE default::Vote {
      CREATE REQUIRED LINK meal: default::Meal {
          SET REQUIRED USING (SELECT
              default::Meal FILTER
                  (.name = 'Lunch')
          LIMIT
              1
          );
      };
  };
};
