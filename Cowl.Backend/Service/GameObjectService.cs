﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Cowl.Backend.DataModel;
using Cowl.Backend.DataModel.GameObjects;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.Extensions.Hosting;

namespace Cowl.Backend.Service
{
    public class GameObjectService : IHostedService
    {
        private readonly GameStorageService _gameService;

        public GameObjectService(GameStorageService gameService)
        {
            _gameService = gameService;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            var connection = new HubConnectionBuilder()
                .WithUrl("http://10.33.94.6:4844/game")
                .Build();

            await connection.StartAsync().ConfigureAwait(false);

            while (!cancellationToken.IsCancellationRequested)
            {
                var fowlsCount = _gameService.AllFowls.ToArray().Length;
                var shitCount = _gameService.AllShits.ToArray().Length;

                var gameObjects = new List<GameObject>();

                for (var i = 200 - fowlsCount; i >= 0; i--)
                {
                    var fowl = new Fowl
                    {
                        Id = Guid.NewGuid().ToString(),
                        Position = ObjectPosition.GetRandom()
                    };
                    gameObjects.Add(fowl);
                }

                for (var i = 75 - shitCount; i >= 0; i--)
                {
                    var shit = new Shit
                    {
                        Id = Guid.NewGuid().ToString(),
                        Position = ObjectPosition.GetRandom()
                    };
                    gameObjects.Add(shit);
                }

                if (gameObjects.Count > 0)
                {
                    await connection.InvokeAsync("spawnGameObjects", gameObjects,
                        cancellationToken: cancellationToken);

                    Console.WriteLine($"Respawn new {gameObjects.Count} gameObjects");
                }


                await connection.InvokeAsync("scores", _gameService.AllPlayers.Select(p => new ScoresItem
                {
                    GameObjectId = p.Id,
                    Scores = p.Scores
                }));

                await Task.Delay(150, cancellationToken);
            }

            await connection.StopAsync();
        }


        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.Delay(1, cancellationToken);
        }
    }
}