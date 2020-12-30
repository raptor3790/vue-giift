import Model from './Model'
import User from './User'
import Pledge from './Pledge'

class Fund extends Model {
  static entity = 'funds'

  static fields () {
    return {
      id: this.attr(null),
      user_id: this.attr(''),
      user: this.hasOne(User, 'id', 'user_id'),
      amount: this.attr(''),
      meta: this.attr(''),
      pledges: this.hasMany(Pledge, 'fund_id'),
      available_at: this.attr(''),
      requested_at: this.attr(''),
      captured_at: this.attr(''),
      delivered_at: this.attr(''),
      payout_id: this.attr(''),
      created_at: this.attr(''),
      updated_at: this.attr('')
    }
  }
}

export default Fund
