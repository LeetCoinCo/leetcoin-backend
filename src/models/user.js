import { id } from './utils'

const user = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'user',
    {
      id: id(DataTypes.UUID),
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      contactNo: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [6, 14]
        }
      },
      profilePic: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
      }
    }
  )

  return User
}

export default user
