import Fund from './Fund'
import Pledge from './Pledge'
import User from './User'
import pledgeSeed from './seed/pledge'
import userSeed from './seed/user'

const models = {
  Fund,
  Pledge,
  User
}

window.Fund = Fund
window.Pledge = Pledge
window.User = User

const registerModels = (database) => {
  Object.values(models).map(m => database.register(m))
}

const addRecordsToStore = (records) => {
  console.log('add records to store', records)
  Object.entries(records).forEach(([entity, records]) => {
    const Model = modelForEntity(entity)
    if (Model) {
      Model.insert({ data: records })
    }
  })
}

const modelForEntity = (entity) => {
  return Object.values(models).find(model => model.entity === entity)
}

const clearForLogout = () => {
  Fund.deleteAll()
  Pledge.deleteAll()
  User.deleteAll()
}

const seed = () => {
  console.log('seed', userSeed)
  User.insert({ data: userSeed })
  Pledge.insert({ data: pledgeSeed })
}

export {
  seed,
  clearForLogout,
  registerModels,
  modelForEntity,
  addRecordsToStore,
  Fund,
  Pledge,
  User
}
