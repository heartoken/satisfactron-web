CREATE MIGRATION m1awzaatibsruea2wyx2ngagmaii3gkf2fuaiafknzmhq7zjvwe4pa
    ONTO m1h22en5kja6h45lwcz2ikx3u3p2iexe7qbnm3lp2uwtbxcl3qbp7a
{
  ALTER TYPE default::Vote {
      ALTER LINK device {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
};
