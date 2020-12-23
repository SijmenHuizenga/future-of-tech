resource "aws_route53_zone" "primary" {
  name = var.domain_name
  lifecycle {
    prevent_destroy = true
  }
}

output "nameservers" {
  value = aws_route53_zone.primary.name_servers
}

resource "aws_acm_certificate" "primary" {
  domain_name       = aws_route53_zone.primary.name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert-validation" {
  for_each = {
    for dvo in aws_acm_certificate.primary.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.primary.zone_id
}


resource "aws_route53_record" "route53_record" {
  depends_on = [
    aws_cloudfront_distribution.website
  ]

  zone_id = aws_route53_zone.primary.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    evaluate_target_health = false

    //HardCoded value for CloudFront
    zone_id = "Z2FDTNDATAQYW2"
  }
}