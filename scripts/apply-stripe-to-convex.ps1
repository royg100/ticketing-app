# Sets STRIPE_SECRET_KEY on Convex (dev + prod). Run from repo root: ticketing-app
# Get key: https://dashboard.stripe.com/apikeys (Test mode: sk_test_...)

param(
  [Parameter(Mandatory = $true)]
  [string] $SecretKey
)

$ErrorActionPreference = "Stop"
if ($SecretKey -notmatch "^sk_(test|live)_") {
  Write-Error "Expected a Stripe secret key (starts with sk_test_ or sk_live_)."
  exit 1
}

Set-Location (Join-Path $PSScriptRoot "..")

Write-Host "Setting STRIPE_SECRET_KEY on dev deployment..."
npx convex env set STRIPE_SECRET_KEY $SecretKey
Write-Host "Setting STRIPE_SECRET_KEY on prod deployment..."
npx convex env set --prod STRIPE_SECRET_KEY $SecretKey
Write-Host "Done. Next: set STRIPE_WEBHOOK_SECRET in Convex when you configure webhooks in Stripe."
