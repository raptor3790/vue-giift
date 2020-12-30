import Model from './Model'
import User from './User'

class Pledge extends Model {
  static entity = 'pledges'

  static fields () {
    return {
      id: this.attr(null),
      from_user_id: this.attr(''),
      from_user: this.hasOne(User, 'id', 'from_user_id'),
      to_user_id: this.attr(''),
      to_user: this.hasOne(User, 'id', 'to_user_id'),
      name: this.attr(''),
      first_name: this.attr(''),
      last_name: this.attr(''),
      amount: this.attr(''),
      fund_id: this.attr(''),
      meta: this.attr(null),
      created_at: this.attr(''),
      updated_at: this.attr('')
    }
  }
}

export default Pledge
