const getPledgeNamesFromName = (pledge) => {
  const nameParts = (pledge.name || '').split(' ')
  return {
    last_name: nameParts.length > 1 ? nameParts.pop() : '',
    first_name: nameParts.join(' ')
  }
}

export default (pledge) => {
  const name = getPledgeNamesFromName(pledge)
  const id = pledge.id
  const message = `Hey ${name.first_name}! I just chipped in to your birthday fund on Giift. Click the link to activate your fund and claim your pledge: ${window.location.origin}/a/${id}`
  return `sms://?&body=${encodeURIComponent(message)}`
}
