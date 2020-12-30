const getClientTemplate = require('_src/lib/getClientTemplate')
const Pledge = require('_src/models/Pledge')
const auth = require('_src/http/routes/auth')

exports.routes = (router) => {
  return [
    ['GET', '/start/:pledgeId', exports.startPledge, { public: true }],
    ['GET', '/:a?/:b?/:c?/:d?', exports.defaultClient, { public: true }]
  ]
}

const renderTemplate = async (initialState = null) => {
  const template = await getClientTemplate()

  return template.replace('</head>', `
    <meta property="og:title" content="I chipped in to your birthday fund on Giift!" />
    <meta property="og:url" content="https://giift.app" />
    <meta property="og:type" content=:website" />
    <meta property="og:description" content="Giift makes it easy to remember all of your friends' birthdays." />
    <meta property="og:image" content="https://s3.amazonaws.com/cdn.giift.app/images/giift-invitation-og.png" />
    <script>window.initialState = ${JSON.stringify(initialState)};</script>
    <script>window.stripePublishableKey = ${JSON.stringify(process.env.STRIPE_PUBLISHABLE_KEY || null)};</script>
    </head>`)
}

exports.startPledge = async (ctx) => {
  // Require SSL if in production
  if (process.env.NODE_ENV === 'production' && !ctx.secure) {
    ctx.status = 301
    ctx.redirect('https://' + ctx.origin.replace('http://', '').replace('https://', '') + ctx.path)
    return
  }

  const pledge = await Pledge.query().findById(ctx.params.pledgeId)

  if (!pledge) {
    ctx.redirect('/')
    return
  }

  if (ctx.state.user) {
    if (pledge.from_user_id + '' === ctx.state.user.id + '') {
      // Don't let a user activate their own pledge
      ctx.redirect('/dashboard')
      return
    }
    if (!pledge.to_user_id) {
      await pledge.activateForUser(ctx.state.user)
    }
    if (pledge.to_user_id && pledge.to_user_id + '' === ctx.state.user.id + '') {
      ctx.redirect(`/activated/${pledge.id}`)
      return
    } else {
      ctx.redirect('/?pledge_invalid=true')
      return
    }
  }

  if (pledge.to_user_id) {
    ctx.redirect('/login')
    return
  }

  ctx.state.initialPledge = pledge
  const initialState = await auth.initialState(ctx)

  return renderTemplate(initialState)
}

exports.defaultClient = async (ctx) => {
  // Require SSL if in production
  if (process.env.NODE_ENV === 'production' && !ctx.secure) {
    ctx.status = 301
    ctx.redirect('https://' + ctx.origin.replace('http://', '').replace('https://', '') + ctx.path)
    return
  }
  const initialState = await auth.initialState(ctx)

  return renderTemplate(initialState)
}
