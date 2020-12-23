resource "aws_cloudfront_distribution" "website" {
  depends_on = [
    aws_s3_bucket.website,
    aws_route53_zone.primary
  ]

  aliases = [var.domain_name]

  origin {
    domain_name = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id   = var.domain_name

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.origin_access_identity.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"


  default_cache_behavior {
    allowed_methods = [
      "GET",
      "HEAD",
    ]

    cached_methods = [
      "GET",
      "HEAD",
    ]

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    compress               = true
    target_origin_id       = var.domain_name
    viewer_protocol_policy = "redirect-to-https"

    // 24 hour
    min_ttl = 24 * 60 * 60

    // 48 hour
    default_ttl = 48 * 60 * 60

    // 7 days
    max_ttl = 7 * 24 * 60 * 60
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.primary.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1"
  }

  wait_for_deployment = false
}