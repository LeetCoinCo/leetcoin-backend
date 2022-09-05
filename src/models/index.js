import Sequelize from 'sequelize'
import { development } from '../config/config'
import user from './user'
import socialProfile from './social-profile'

let sequelize
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres'
  })
} else {
  sequelize = new Sequelize(
    development.database,
    development.username,
    development.password,
    {
      dialect: 'postgres'
    }
  )
}

const models = {
  User: user(sequelize, Sequelize.DataTypes),
  SocialProfile: socialProfile(sequelize, Sequelize.DataTypes),
}

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models)
  }
})

export { sequelize }

export default models
