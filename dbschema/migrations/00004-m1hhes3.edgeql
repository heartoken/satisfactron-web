CREATE MIGRATION m1hhes3xwucistja7qe7u6ck2rgshn5nrkb7ligjsaihnuk5uy7ftq
    ONTO m1d4y3pjislvqyggpwaedafqia4czzx3bjl2vh6bmq4zbq6yf5vnjq
{
  ALTER TYPE default::Device {
      ALTER LINK votes {
          SET MULTI;
      };
      ALTER PROPERTY name {
          SET REQUIRED USING ('unnamed Device');
      };
  };
};
