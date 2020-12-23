# How to deploy

This website is build to run on AWS, so is this guide.

1. Create an aws account, create an IAM user with programmatic access that will be used for deployment only, export the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` env variables.
2. Create a s3 bucket that will hold the terraform state. Ensure it is only accessible to the deployment user. Enable versioning, disable public access. Replace the terraform backend in `main.tf` with the name and region of the bucket you just created.
3. Run `terraform init`. Should work. Resolve any errors.
4. Get a domain (or subdomain) from somewhere. Update the `domainname` variable in main.tf with your (sub-) domain.
5. Change the `region` variable to whatever region you like.
6. Run `terraform apply`.
7. Now it will fail because of certificate shizzle. You need to change the nameserver of your domain to point to the aws route53 zone. Go into the aws route53 console, find the zone, copy the NS recods to your domain.
8. Wait until the certificate becomes valid.
9. Run `terraform apply` again. It should finish successfully. 