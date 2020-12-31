This code is used to deploy the site to AWS. It is here so you can see how it works, check it and suggestion changes.

To run it, export the following environment variables:

* `AWS_ACCESS_KEY_ID`
* `AWS_SECRET_ACCESS_KEY`
* `TF_VAR_RECAPCHA_SERVER_TOKEN`

Run `terraform apply`.

Note; this code is not built to be deployed on multiple environments.
It hasn't been tested outside prod... run at own risk ;)