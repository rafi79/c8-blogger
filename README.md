// README.md
# C8 Blogger - AI-Powered Social Media Automation

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/c8-blogger)

## 🚀 Features

- **AI Content Generation**: Powered by Google Gemini API
- **Multi-Platform Posting**: Twitter, Facebook, Instagram automation
- **Secure Authentication**: JWT-based user system
- **Modern UI**: Beautiful, responsive design with animations
- **Credential Management**: Encrypted storage of social media accounts
- **Real-time Feedback**: Toast notifications and loading states

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, JWT Authentication
- **AI**: Google Gemini API
- **Automation**: Puppeteer
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- Google Gemini API Key
- Social media accounts for testing

## ⚡ Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/c8-blogger.git
   cd c8-blogger
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your environment variables:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=your_jwt_secret_32_characters_min
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy with Vercel**
   ```bash
   npx vercel
   ```

3. **Add environment variables in Vercel dashboard**
   - Go to your project settings
   - Add all environment variables
   - Redeploy

## 📚 Usage

1. **Register/Login**: Create an account or sign in
2. **Add Credentials**: Securely store your social media login details
3. **Generate Content**: Use AI to create engaging posts
4. **Post Everywhere**: Publish to all platforms simultaneously
5. **Track History**: Monitor your posting activity

## 🔒 Security

- All passwords are encrypted using bcrypt
- JWT tokens for secure authentication
- Environment variables for sensitive data
- Input validation on all endpoints

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues, please check the [troubleshooting guide](docs/troubleshooting.md) or open an issue.

---

Made with ❤️ by the C8 Blogger Team