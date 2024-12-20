const express = require('express');
const path = require('path');
const { nextTick } = require('process');

const mongoose= require('mongoose');
const bodyParser = require('express').json();

const cookieParser= require('cookie-parser');

const authRoutes = require('./routes/authRoutes');

const app = express();

const morgan = require('morgan'); //loggers for middleware 

app.use(morgan('dev'));
const { requireAuth, checkUser } = require('./middleware/authMiddleware');

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.set('view engine', 'ejs');

// Apply checkUser middleware to all routes
app.get('*', checkUser);
app.use(authRoutes);

//db uri 
const DBURI = 'mongodb+srv://saarth62:Saarth11@cluster0.dlm61.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(DBURI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(3001, () => {
      console.log('Server is running on port 3001');
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

app.get('/', (req, res) => {
    res.render('index', {
      title: 'Hello Guys!',
      name: 'Guys',
      message: 'Welcome back'
    });
  });

app.get('/about' ,requireAuth, (req, res) => {
    res.render('about', {
        title: 'About Me',
        name: 'Saarth',
        profession: 'Software engineer',
        location: 'Ind',
        specialties: 'building things from scratch',
        interests: 'engineering',
        experience: '1.5',
        field: 'Software',
        projects: 'different types of projects ranging from quantitiative strategies investments to AI',
        email: 'saarth62@gmail.com'
    });
});

app.get('/latest-posts', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.render('latest-posts', {
            title: 'Latest Posts',
            blogs: blogs
        });
    } catch (err) {
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error fetching blog posts'
        });
    }
});

app.get('/create-blog', requireAuth, (req, res) => {
    res.render('create-blog', {
        title: 'Create New Blog Post'
    });
});

const Blog = require('./models/blog');

app.post('/create-blog',  async (req, res) => {
  try {
    const blog = new Blog({
      title: req.body.title,
      content: req.body.content,
      author: 'Saarth'
    });
    
    const savedBlog = await blog.save();
    res.status(201).json({
      success: true,
      blog: savedBlog,
      message: 'Blog created successfully!'
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Error creating blog',
      error: err.message
    });
  }
});

app.delete('/blog/:id', async (req, res) => {
    try {
        const result = await Blog.findByIdAndDelete(req.params.id);
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        res.json({
            success: true,
            message: 'Blog post deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error deleting blog post',
            error: err.message
        });
    }
});

//addd update request here

app.use((req, res) => {
    res.status(404).render('404', {
        title: '404 - Page Not Found'
    });
});


// app.use(authRoutes);


// app.listen(3001, () => {
//     console.log('Server is running on port 3001');
// });


