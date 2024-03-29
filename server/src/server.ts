import express from 'express';
import {PrismaClient} from '@prisma/client'
import cors from 'cors';
import { convertHourStringToMinutes } from './utils/convert-hour-string-to-minutes';
import { convertMinutesToHourString } from './utils/convert-minutes-to-hour-string';


const app = express();

app.use(express.json())
app.use(cors())

const port = 3000;

const prisma = new PrismaClient({
  log:['query']
})


app.get('/games', async (request,  response)=>{
  const games = await prisma.game.findMany({
    include:{
      _count:{
        select:{
          ads: true,
        }
      }
    }
  })   //traz tods os metodos

  
  return response.json(games);
});

app.post('/games/:gameId/ads', async (request, response) => {
  const gameId = request.params.gameId;
  const body:any= request.body

  console.log(body)
  
  const ad= await prisma.ad.create({
    data: {
      gameId,
      names: body.name,
      yearsPlaying: body.yearsPlaying,
      discord: body.discord,
      weekDays: body.weekDays.join(','),
      hoursStart: convertHourStringToMinutes(body.hoursStart),
      hoursEnd: convertHourStringToMinutes(body.hoursEnd),
      useVoiceChannel: body.useVoiceChannel

    }
  })
  return response.status(201).json(ad);
  

});

app.get('/games/:id/ads', async (request, response) => {
  const gameId = request.params.id;
  

  const ads = await prisma.ad.findMany({
    select:{
      id: true,
      names: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hoursStart: true,
      hoursEnd: true,
    },
    where:{
      gameId,
    },
    orderBy:{
      createdAt:'desc',
    }
  })
  return response.json(ads.map(ad=> {
    return{
      ...ad,
      weekDays: ad.weekDays.split(','),
      hoursStart: convertMinutesToHourString(ad.hoursStart),
      hoursEnd: convertMinutesToHourString(ad.hoursEnd),
    }
  }));
});

app.get('/ads/:id/discord', async(request, response) => {
  const adId = request.params.id;
  
  const ad = await prisma.ad.findUniqueOrThrow({  //tentar encotrar ad,s e não acahr ele da erro
    select:{
      discord: true,
    },
    where:{
      id: adId,
    }
  })

  return response.json({
    discord: ad.discord,
})
})

app.listen(3000)
