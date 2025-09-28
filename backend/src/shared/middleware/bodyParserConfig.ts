import express from 'express';

export const bodyParserConfig = {
  json: express.json({ 
    limit: process.env.MAX_FILE_SIZE || '10mb' 
  }),
  urlencoded: express.urlencoded({ 
    extended: true, 
    limit: process.env.MAX_FILE_SIZE || '10mb' 
  })
};
