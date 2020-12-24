data "aws_iam_policy_document" "s3_bucket_policy" {
  statement {
    sid = "1"

    actions = [
      "s3:GetObject",
    ]

    resources = [
      "arn:aws:s3:::${aws_route53_zone.primary.name}/*",
    ]

    principals {
      type = "AWS"

      identifiers = [
        aws_cloudfront_origin_access_identity.origin_access_identity.iam_arn,
      ]
    }
  }
}

resource "aws_s3_bucket" "website" {
  bucket = var.domain_name
  acl    = "private"
  versioning {
    enabled = true
  }
  policy = data.aws_iam_policy_document.s3_bucket_policy.json
}
locals {
  mime_type_mappings = {
    txt   = "text/plain; charset=utf-8"
    html  = "text/html; charset=utf-8"
    css   = "text/css; charset=utf-8"
    js    = "application/javascript"
    json  = "application/json"
    gif   = "image/gif"
    jpeg  = "image/jpeg"
    jpg   = "image/jpeg"
    png   = "image/png"
    svg   = "image/svg"
    webp  = "image/webp"
    weba  = "audio/webm"
    webm  = "video/webm"
    ttf   = "font/ttf"
    otf   = "font/otf"
    eot   = "application/vnd.ms-fontobject"
    woff  = "font/woff"
    woff2 = "font/woff2"
  }
}

resource "aws_s3_bucket_object" "website" {
  for_each     = fileset(path.module, "../webapp/**")
  bucket       = aws_s3_bucket.website.bucket
  key          = substr(each.value, length("../webapp/"), -1)
  source       = "${path.module}/${each.value}"
  etag         = filemd5("${path.module}/${each.value}")
  content_type = lookup(local.mime_type_mappings, concat(regexall("\\.([^\\.]*)$", each.value), [[""]])[0][0], "application/octet-stream")

  cache_control = "no-cache"
}

resource "aws_cloudfront_origin_access_identity" "origin_access_identity" {
  comment = "access-identity-${aws_route53_zone.primary.name}.s3.amazonaws.com"
}

