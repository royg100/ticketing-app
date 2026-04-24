import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { internal } from './_generated/api';

const http = httpRouter();

http.route({
  path: '/stripe-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') ?? '';
    const result = await ctx.runAction(internal.stripeWebhook.processRawEvent, {
      body,
      signature,
    });
    if (result && typeof result === 'object' && 'ok' in result) {
      if (result.ok === false && 'error' in result && result.error === 'invalid_signature') {
        return new Response(null, { status: 400 });
      }
      if (result.ok === false && 'error' in result && result.error === 'stripe_env') {
        return new Response(null, { status: 500 });
      }
    }
    return new Response(null, { status: 200 });
  }),
});

export default http;
