import Model from './Model'

class User extends Model {
  static entity = 'users'

  static fields () {
    return {
      id: this.attr(null),
      first_name: this.attr(''),
      last_name: this.attr(''),
      birthday: this.attr(''),
      phone: this.attr(''),
      email: this.attr(''),
      meta: this.attr(''),
      created_at: this.attr(''),
      payment_source: this.attr('')
    }
  }
}

export default User
