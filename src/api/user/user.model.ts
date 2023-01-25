import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";


export interface UserDocument extends Document{
  email:string,
  password:string,
  lists?:string[]

  createdAt: Date;
  updatedAt: Date;

  comparePassword: (password: string) => Promise<boolean>;
}
const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  lists: [{ type: String }],
},
{
  timestamps: true,
});

//Middlewares
UserSchema.pre("save", async function save(next: Function) {
  const user = this as UserDocument;

  try {
    if (!user.isModified("password")) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
  } catch (error) {
    next(error);
  }
});
const User = model<UserDocument>("User", UserSchema);

//Methods
async function comparePassword(
  this: UserDocument,
  candidatePassword: string,
  next: Function
): Promise<boolean> {
  const user = this;

  try {
    console.log(candidatePassword, user.password);
    const match = await bcrypt.compare(candidatePassword, user.password);

    return match;
  } catch (error: any) {
    next(error);
    return false;
  }
}
UserSchema.methods.comparePassword = comparePassword;

export default User;