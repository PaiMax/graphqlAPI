import mongoose, { Document, Schema } from 'mongoose';

// Define an interface for the User document that extends mongoose Document
interface IUser extends Document {
  username: string;
  password: string;
}

// Define the Mongoose schema
const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Create the model using the schema and the interface
const User = mongoose.model<IUser>('User', userSchema);

export default User;
