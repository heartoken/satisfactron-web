CREATE MIGRATION m1h22en5kja6h45lwcz2ikx3u3p2iexe7qbnm3lp2uwtbxcl3qbp7a
    ONTO initial
{
  CREATE FUTURE simple_scoping;
  CREATE TYPE default::Device {
      CREATE PROPERTY name: std::str;
  };
  CREATE TYPE default::Vote {
      CREATE REQUIRED LINK device: default::Device;
      CREATE REQUIRED PROPERTY value: std::int16 {
          CREATE CONSTRAINT std::max_value(5);
          CREATE CONSTRAINT std::min_value(1);
      };
  };
  ALTER TYPE default::Device {
      CREATE LINK votes := (.<device[IS default::Vote]);
  };
};
