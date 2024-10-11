import xmlrpc from 'xmlrpc';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export async function postToWordPress(article) {
  const client = xmlrpc.createSecureClient({
    host: process.env.WORDPRESS_HOST,
    port: 443,
    path: '/xmlrpc.php',
  });

  const username = process.env.WORDPRESS_USERNAME;
  const password = process.env.WORDPRESS_PASSWORD;

  try {
    const categories = await getCategories(client, username, password);
    const categoryId = findRelevantCategory(categories, article.keywords);

    const imageUrl = await uploadFeaturedImage(client, username, password, article.title);

    const post = {
      post_type: 'post',
      post_title: article.title,
      post_content: formatContent(article),
      post_status: 'publish',
      terms: {
        category: [categoryId],
        post_tag: article.keywords,
      },
      post_thumbnail: imageUrl,
    };

    // Adăugăm informații despre limba articolului
    if (article.language) {
      post.post_language = article.language;
    }

    const postId = await new Promise((resolve, reject) => {
      client.methodCall('wp.newPost', [0, username, password, post], (error, value) => {
        if (error) reject(error);
        else resolve(value);
      });
    });

    console.log(`Article published successfully in ${article.language}. Post ID: ${postId}`);
  } catch (error) {
    console.error('Error publishing to WordPress:', error);
  }
}

// ... (restul funcțiilor rămân neschimbate)