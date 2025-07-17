CREATE MIGRATION m1d4y3pjislvqyggpwaedafqia4czzx3bjl2vh6bmq4zbq6yf5vnjq
    ONTO m1awzaatibsruea2wyx2ngagmaii3gkf2fuaiafknzmhq7zjvwe4pa
{
  ALTER TYPE default::Vote {
      CREATE REQUIRED PROPERTY created_at: std::datetime {
          SET default := (std::datetime_current());
      };
  };
};
