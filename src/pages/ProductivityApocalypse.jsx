import React, { useState, useEffect } from 'react';

const ProductivityApocalypse = () => {
  // Game state
  const [hero, setHero] = useState({
    name: "Survivor",
    health: 100,
    maxHealth: 100,
    energy: 100,
    maxEnergy: 100,
    hunger: 0,
    thirst: 0,
    experience: 0,
    level: 1,
    charisma: 5,
    luck: 5,
    morality: 5,
    inventory: {
      resources: 0,
      money: 500,
      medkits: 1,
      water: 2,
      food: 2
    },
    position: 0,
    traveledDistance: 0,
    skills: {
      foraging: 1,
      trading: 1,
      survival: 1,
      crafting: 1
    },
    avatar: "👤"
  });
  
  const [tasks, setTasks] = useState([
    { id: 1, title: "Drink 2L of water", difficulty: 1, completed: false, daysLeft: 1, reward: { experience: 50, resources: 1 } },
    { id: 2, title: "Exercise for 30 minutes", difficulty: 2, completed: false, daysLeft: 1, reward: { experience: 100, resources: 2 } },
    { id: 3, title: "Complete work project", difficulty: 3, completed: false, daysLeft: 3, reward: { experience: 200, resources: 4 } }
  ]);
  
  const [world, setWorld] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [npcEncounter, setNpcEncounter] = useState(null);
  const [weatherCondition, setWeatherCondition] = useState("clear");
  const [gameLog, setGameLog] = useState([{ text: "Welcome to the Post-Apocalyptic Productivity Journey. Complete real-life tasks to advance your character.", type: "info" }]);
  const [newTask, setNewTask] = useState({ title: "", difficulty: 1, daysLeft: 1 });
  const [tab, setTab] = useState("hero");
  const [avatarOptions] = useState(["👤", "🧔", "👩", "🧙", "👮", "🤠", "🥷", "👷"]);
  const [showTutorial, setShowTutorial] = useState(true);
  const [visibleMapRange, setVisibleMapRange] = useState(10);
  const [questLog, setQuestLog] = useState([
    { id: 1, title: "Reach the first city", completed: false, description: "Travel 20km to reach the first city." },
    { id: 2, title: "Become a trader", completed: false, description: "Trade with 5 different traders." },
    { id: 3, title: "Survivor", completed: false, description: "Reach level 5." }
  ]);

  // Weather types and their effects
  const weatherTypes = {
    "clear": { icon: "☀️", effect: "No special effects" },
    "rain": { icon: "🌧️", effect: "-10% energy regeneration" },
    "storm": { icon: "⛈️", effect: "-20% energy regeneration, +10% bandit encounter chance" },
    "fog": { icon: "🌫️", effect: "+15% bandit encounter chance" },
    "hot": { icon: "🔥", effect: "+10% thirst rate" },
    "cold": { icon: "❄️", effect: "+10% hunger rate" }
  };
  
  // Generate world
  useEffect(() => {
    generateWorld();
    // Generate random weather every 5-10 completed tasks
    const randomWeather = Object.keys(weatherTypes)[Math.floor(Math.random() * Object.keys(weatherTypes).length)];
    setWeatherCondition(randomWeather);
  }, []);
  
  // Apply periodic effects (hunger, thirst, etc)
  useEffect(() => {
    const timer = setInterval(() => {
      setHero(prevHero => {
        // Increase hunger and thirst over time
        const hungerIncrease = weatherCondition === "cold" ? 1.1 : 1;
        const thirstIncrease = weatherCondition === "hot" ? 1.1 : 1;
        
        return {
          ...prevHero,
          hunger: Math.min(100, prevHero.hunger + (0.5 * hungerIncrease)),
          thirst: Math.min(100, prevHero.thirst + (0.7 * thirstIncrease))
        };
      });
    }, 10000); // Every 10 seconds
    
    return () => clearInterval(timer);
  }, [weatherCondition]);
  
  // Update current location when hero moves
  useEffect(() => {
    if (world.length > 0 && hero.position < world.length) {
      const newLocation = world[hero.position];
      if (currentLocation?.id !== newLocation.id) {
        setCurrentLocation(newLocation);
        // Mark location as visited
        setWorld(prevWorld => prevWorld.map(loc => 
          loc.id === newLocation.id ? {...loc, visited: true} : loc
        ));
        
        // Check for quests completion
        if (newLocation.type === "city" && hero.position >= 20 && !questLog[0].completed) {
          setQuestLog(prev => prev.map(q => q.id === 1 ? {...q, completed: true} : q));
          addToLog("Quest completed: Reach the first city!", "quest");
          setHero(prev => ({...prev, inventory: {...prev.inventory, money: prev.inventory.money + 200}}));
        }
        
        // Check for NPC encounters
        triggerNpcEncounter(newLocation.type);
      }
    }
  }, [hero.position, world]);
  
  // Update quest status when relevant stats change
  useEffect(() => {
    // Check if player reached level 5
    if (hero.level >= 5 && !questLog[2].completed) {
      setQuestLog(prev => prev.map(q => q.id === 3 ? {...q, completed: true} : q));
      addToLog("Quest completed: Survivor!", "quest");
      setHero(prev => ({...prev, inventory: {...prev.inventory, medkits: prev.inventory.medkits + 1}}));
    }
  }, [hero.level]);
  
  // NPC encounter probability based on location type and weather
  const triggerNpcEncounter = (locationType) => {
    let encounterChance = 0;
    let encounterType = "";
    
    // Base encounter chances
    let banditModifier = weatherCondition === "storm" || weatherCondition === "fog" ? 0.15 : 0;
    
    switch(locationType) {
      case "city":
        encounterChance = Math.random() < 0.8 ? "trader" : null;
        break;
      case "bandit camp":
        encounterChance = Math.random() < (0.9 + banditModifier) ? "bandit" : null;
        break;
      case "trader camp":
        encounterChance = "trader";
        break;
      case "ruins":
        encounterChance = Math.random() < (0.6 + banditModifier) ? "bandit" : Math.random() < 0.3 ? "trader" : Math.random() < 0.2 ? "survivor" : null;
        break;
      case "forest":
        encounterChance = Math.random() < (0.4 + banditModifier) ? "bandit" : Math.random() < 0.3 ? "survivor" : null;
        break;
      default:
        encounterChance = Math.random() < (0.2 + banditModifier) ? (Math.random() < 0.5 ? "trader" : "bandit") : Math.random() < 0.1 ? "survivor" : null;
    }
    
    if (encounterChance) {
      setNpcEncounter(encounterChance);
      addToLog(`You encountered a ${encounterChance}!`, "encounter");
    } else {
      setNpcEncounter(null);
    }
  };
  
  // Generate a world map
  const generateWorld = () => {
    const worldMap = [];
    const locations = ["meadow", "swamp", "forest", "ruins", "trader camp", "bandit camp", "road", "mountains", "city"];
    
    // Generate 100 locations with cities every 20 spaces
    for (let i = 0; i < 100; i++) {
      let locationType;
      
      if (i % 20 === 0 && i > 0) {
        locationType = "city";
      } else {
        // Use a hash-like approach to create "unpredictable but consistent" locations
        const seed = (i * 9973) % 1000; // Prime number multiplication for pseudo-randomness
        
        if (seed < 200) locationType = "meadow";
        else if (seed < 300) locationType = "swamp";
        else if (seed < 450) locationType = "forest";
        else if (seed < 600) locationType = "ruins";
        else if (seed < 700) locationType = "road";
        else if (seed < 800) locationType = "mountains";
        else if (seed < 900) locationType = "trader camp";
        else locationType = "bandit camp";
      }
      
      worldMap.push({
        id: i,
        type: locationType,
        visited: i === 0,
        resources: Math.floor(Math.random() * 3) // Random resources at each location
      });
    }
    
    setWorld(worldMap);
  };
  
  // Add a log entry
  const addToLog = (text, type = "info") => {
    setGameLog(prevLog => [...prevLog, { text, type, timestamp: new Date().toLocaleTimeString() }]);
  };
  
  // Complete a task
  const completeTask = (taskId) => {
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          // Calculate reward
          const updatedHero = { ...hero };
          updatedHero.experience += task.reward.experience;
          updatedHero.inventory.resources += task.reward.resources;
          
          // Check for level up
          const newLevel = Math.floor(1 + Math.sqrt(updatedHero.experience / 100));
          if (newLevel > updatedHero.level) {
            updatedHero.level = newLevel;
            // Update max health and energy with level
            updatedHero.maxHealth = 100 + (newLevel * 5);
            updatedHero.maxEnergy = 100 + (newLevel * 5);
            // Restore health and energy on level up
            updatedHero.health = updatedHero.maxHealth;
            updatedHero.energy = updatedHero.maxEnergy;
            addToLog(`Level up! You are now level ${newLevel}!`, "levelup");
          }
          
          // Move character - Fixed movement calculation
          updatedHero.traveledDistance += task.difficulty * 2; // Movement based on task difficulty
          const newPosition = Math.min(world.length - 1, Math.floor(updatedHero.traveledDistance / 5));
          
          if (newPosition > updatedHero.position) {
            updatedHero.position = newPosition;
            if (world[newPosition]) {
              addToLog(`You've traveled to a new location: ${world[newPosition].type}`, "travel");
            }
          }
          
          // Random skill improvement
          const skillNames = Object.keys(updatedHero.skills);
          const randomSkill = skillNames[Math.floor(Math.random() * skillNames.length)];
          if (Math.random() < 0.3) { // 30% chance of skill improvement
            updatedHero.skills[randomSkill] += 1;
            addToLog(`Your ${randomSkill} skill improved to level ${updatedHero.skills[randomSkill]}!`, "skill");
          }
          
          // Random weather change
          if (Math.random() < 0.2) { // 20% chance of weather change
            const newWeather = Object.keys(weatherTypes)[Math.floor(Math.random() * Object.keys(weatherTypes).length)];
            setWeatherCondition(newWeather);
            addToLog(`The weather has changed to ${newWeather}. ${weatherTypes[newWeather].effect}`, "weather");
          }
          
          setHero(updatedHero);
          addToLog(`Task completed: ${task.title}. You earned ${task.reward.experience} XP and ${task.reward.resources} resources.`, "success");
          return { ...task, completed: true };
        }
        return task;
      })
    );
  };
  
  // Add a new task
  const addTask = () => {
    if (newTask.title.trim() === "") return;
    
    const difficultyMultiplier = parseInt(newTask.difficulty);
    const reward = {
      experience: 50 * difficultyMultiplier,
      resources: difficultyMultiplier
    };
    
    const task = {
      id: Date.now(),
      title: newTask.title,
      difficulty: difficultyMultiplier,
      completed: false,
      daysLeft: parseInt(newTask.daysLeft),
      reward
    };
    
    setTasks([...tasks, task]);
    setNewTask({ title: "", difficulty: 1, daysLeft: 1 });
    addToLog(`New task added: ${task.title}`, "info");
  };
  
  // Trade with NPC
  const trade = () => {
    if (npcEncounter === "trader") {
      if (hero.inventory.resources >= 1) {
        const skillBonus = hero.skills.trading / 10;
        const resourcesSold = 1;
        const moneyEarned = Math.floor(100 * (1 + (hero.charisma / 10) + skillBonus));
        
        setHero(prevHero => {
          // Check for trader quest completion
          const tradersInteracted = prevHero.skills.trading;
          const updatedHero = {
            ...prevHero,
            inventory: {
              ...prevHero.inventory,
              resources: prevHero.inventory.resources - resourcesSold,
              money: prevHero.inventory.money + moneyEarned
            },
            skills: {
              ...prevHero.skills,
              trading: prevHero.skills.trading + 0.2
            }
          };
          
          // Check quest completion
          if (Math.floor(updatedHero.skills.trading) >= 5 && !questLog[1].completed) {
            setQuestLog(prev => prev.map(q => q.id === 2 ? {...q, completed: true} : q));
            addToLog("Quest completed: Become a trader!", "quest");
            updatedHero.inventory.money += 300;
          }
          
          return updatedHero;
        });
        
        addToLog(`Traded ${resourcesSold} resources for ${moneyEarned.toFixed(0)} money with trader.`, "trade");
      } else {
        addToLog("You don't have enough resources to trade.", "warning");
      }
    } else if (npcEncounter === "bandit") {
      // Resist bandit attack
      const skillBonus = hero.skills.survival / 10;
      const successChance = (hero.luck / 10) + skillBonus;
      if (Math.random() < successChance) {
        addToLog("You successfully defended yourself against the bandit!", "success");
        // Gain survival experience
        setHero(prev => ({
          ...prev, 
          skills: {
            ...prev.skills,
            survival: prev.skills.survival + 0.3
          }
        }));
      } else {
        const resourcesLost = Math.min(1, hero.inventory.resources);
        const moneyLost = Math.min(Math.floor(Math.random() * 100) + 50, hero.inventory.money);
        const healthLost = Math.floor(Math.random() * 10) + 5;
        
        setHero(prevHero => ({
          ...prevHero,
          health: Math.max(1, prevHero.health - healthLost),
          inventory: {
            ...prevHero.inventory,
            resources: prevHero.inventory.resources - resourcesLost,
            money: prevHero.inventory.money - moneyLost
          }
        }));
        
        addToLog(`Bandit attack! Lost ${resourcesLost} resources, ${moneyLost} money, and ${healthLost} health.`, "danger");
      }
    } else if (npcEncounter === "survivor") {
      // Help the survivor
      if (hero.inventory.food >= 1 || hero.inventory.water >= 1) {
        let gave = "";
        
        setHero(prevHero => {
          const updatedInventory = {...prevHero.inventory};
          
          if (prevHero.inventory.food >= 1) {
            updatedInventory.food -= 1;
            gave = "food";
          } else {
            updatedInventory.water -= 1;
            gave = "water";
          }
          
          return {
            ...prevHero,
            morality: Math.min(10, prevHero.morality + 0.5),
            skills: {
              ...prevHero.skills,
              charisma: prevHero.skills.charisma + 0.2
            },
            inventory: updatedInventory
          };
        });
        
        // Random reward chance
        if (Math.random() < 0.5) {
          const reward = Math.random() < 0.7 ? 
            {type: "money", amount: Math.floor(Math.random() * 50) + 10} : 
            {type: "resources", amount: 1};
            
          setHero(prevHero => ({
            ...prevHero,
            inventory: {
              ...prevHero.inventory,
              [reward.type === "money" ? "money" : "resources"]: 
                prevHero.inventory[reward.type === "money" ? "money" : "resources"] + reward.amount
            }
          }));
          
          addToLog(`You gave the survivor ${gave}. They thanked you and shared ${reward.amount} ${reward.type} with you!`, "success");
        } else {
          addToLog(`You gave the survivor ${gave}. They thanked you and went on their way.`, "info");
        }
      } else {
        addToLog("You don't have any food or water to share with the survivor.", "warning");
      }
    }
    
    // Clear encounter after interaction
    setNpcEncounter(null);
  };
  
  // Rest to recover health and energy
  const rest = () => {
    const energyRecoveryModifier = weatherCondition === "rain" ? 0.9 : 
                                 weatherCondition === "storm" ? 0.8 : 1;
                                 
    if (hero.energy < hero.maxEnergy || hero.health < hero.maxHealth) {
      const healthRecovered = Math.min(10, hero.maxHealth - hero.health);
      const energyRecovered = Math.min(20 * energyRecoveryModifier, hero.maxEnergy - hero.energy);
      
      setHero(prevHero => ({
        ...prevHero,
        health: prevHero.health + healthRecovered,
        energy: prevHero.energy + energyRecovered,
        hunger: Math.min(100, prevHero.hunger + 10),
        thirst: Math.min(100, prevHero.thirst + 15)
      }));
      
      addToLog(`Rested. Recovered ${healthRecovered.toFixed(1)} health and ${energyRecovered.toFixed(1)} energy.`, "info");
    } else {
      addToLog("You're already well-rested.", "info");
    }
  };
  
  // Eat to reduce hunger
  const eat = () => {
    if (hero.hunger > 0) {
      if (hero.inventory.food > 0) {
        setHero(prevHero => ({
          ...prevHero,
          hunger: Math.max(0, prevHero.hunger - 30),
          health: Math.min(prevHero.maxHealth, prevHero.health + 5),
          inventory: {
            ...prevHero.inventory,
            food: prevHero.inventory.food - 1
          }
        }));
        
        addToLog("You ate some food and reduced your hunger.", "info");
      } else if (hero.inventory.money >= 50) {
        setHero(prevHero => ({
          ...prevHero,
          hunger: Math.max(0, prevHero.hunger - 30),
          health: Math.min(prevHero.maxHealth, prevHero.health + 5),
          inventory: {
            ...prevHero.inventory,
            money: prevHero.inventory.money - 50,
            food: prevHero.inventory.food + 1 // Buy extra food
          }
        }));
        
        addToLog("You spent 50 money on food and reduced your hunger. You got an extra portion for later.", "info");
      } else {
        addToLog("You don't have food or enough money to buy food.", "warning");
      }
    } else {
      addToLog("You're not hungry.", "info");
    }
  };
  
  // Drink to reduce thirst
  const drink = () => {
    if (hero.thirst > 0) {
      if (hero.inventory.water > 0) {
        setHero(prevHero => ({
          ...prevHero,
          thirst: Math.max(0, prevHero.thirst - 40),
          inventory: {
            ...prevHero.inventory,
            water: prevHero.inventory.water - 1
          }
        }));
        
        addToLog("You drank some water and reduced your thirst.", "info");
      } else if (hero.inventory.money >= 30) {
        setHero(prevHero => ({
          ...prevHero,
          thirst: Math.max(0, prevHero.thirst - 40),
          inventory: {
            ...prevHero.inventory,
            money: prevHero.inventory.money - 30,
            water: prevHero.inventory.water + 1 // Buy extra water
          }
        }));
        
        addToLog("You spent 30 money on water and reduced your thirst. You got an extra bottle for later.", "info");
      } else {
        addToLog("You don't have water or enough money to buy water.", "warning");
      }
    } else {
      addToLog("You're not thirsty.", "info");
    }
  };
  
  // Use medkit to heal
  const useMedkit = () => {
    if (hero.inventory.medkits > 0 && hero.health < hero.maxHealth) {
      setHero(prevHero => ({
        ...prevHero,
        health: Math.min(prevHero.maxHealth, prevHero.health + 50),
        inventory: {
          ...prevHero.inventory,
          medkits: prevHero.inventory.medkits - 1
        }
      }));
      
      addToLog("You used a medkit and recovered 50 health!", "success");
    } else if (hero.health >= hero.maxHealth) {
      addToLog("You're already at full health.", "info");
    } else {
      addToLog("You don't have any medkits.", "warning");
    }
  };
  
  // Forage for resources
  const forage = () => {
    if (hero.energy >= 20) {
      const skillBonus = hero.skills.foraging / 10;
      const successChance = 0.5 + skillBonus;
      
      if (Math.random() < successChance) {
        const resourcesFound = Math.floor(Math.random() * 2) + 1;
        let foodFound = Math.random() < 0.3 ? 1 : 0;
        let waterFound = Math.random() < 0.4 ? 1 : 0;
        
        setHero(prevHero => ({
          ...prevHero,
          energy: Math.max(0, prevHero.energy - 20),
          inventory: {
            ...prevHero.inventory,
            resources: prevHero.inventory.resources + resourcesFound,
            food: prevHero.inventory.food + foodFound,
            water: prevHero.inventory.water + waterFound
          },
          skills: {
            ...prevHero.skills,
            foraging: prevHero.skills.foraging + 0.2
          }
        }));
        
        let foundMessage = `You foraged and found ${resourcesFound} resources`;
        if (foodFound) foundMessage += `, ${foodFound} food`;
        if (waterFound) foundMessage += `, ${waterFound} water`;
        addToLog(foundMessage + ".", "success");
      } else {
        setHero(prevHero => ({
          ...prevHero,
          energy: Math.max(0, prevHero.energy - 20),
          skills: {
            ...prevHero.skills,
            foraging: prevHero.skills.foraging + 0.1
          }
        }));
        
        addToLog("You foraged but didn't find anything useful.", "warning");
      }
    } else {
      addToLog("You don't have enough energy to forage.", "warning");
    }
  };
  
  // Change avatar
  const changeAvatar = (newAvatar) => {
    setHero(prevHero => ({...prevHero, avatar: newAvatar}));
  };
  
  // UI Helper - get color for difficulty level
  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 1: return "bg-green-100 border-green-400";
      case 2: return "bg-yellow-100 border-yellow-400";
      case 3: return "bg-red-100 border-red-400";
      default: return "bg-gray-100 border-gray-400";
    }
  };
  
  // UI Helper - get color for location type
  const getLocationColor = (locationType) => {
    switch(locationType) {
      case "meadow": return "bg-green-300";
      case "swamp": return "bg-teal-900 text-white";
      case "forest": return "bg-green-800 text-white";
      case "ruins": return "bg-gray-500 text-white";
      case "trader camp": return "bg-yellow-300";
      case "bandit camp": return "bg-red-800 text-white";
      case "road": return "bg-gray-300";
      case "mountains": return "bg-gray-600 text-white";
      case "city": return "bg-blue-500 text-white";
      default: return "bg-gray-200";
    }
  };
  
  // Get location icon
  const getLocationIcon = (locationType) => {
    switch(locationType) {
      case "meadow": return "🌿";
      case "swamp": return "🌱";
      case "forest": return "🌲";
      case "ruins": return "🏚️";
      case "trader camp": return "🛒";
      case "bandit camp": return "⚔️";
      case "road": return "🛣️";
      case "mountains": return "⛰️";
      case "city": return "🏙️";
      default: return "❓";
    }
  };
  
  // Close tutorial modal
  const closeTutorial = () => {
    setShowTutorial(false);
  };
  
  // Render UI
  return (
    <div className="flex flex-col min-h-screen max-w-6xl mx-auto p-4 bg-gray-100">
      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Welcome to Path Home: Post-Apocalyptic Productivity</h2>
            <p className="mb-4">In this game, your real-life tasks help your survivor navigate through a post-apocalyptic world.</p>
            
            <h3 className="text-xl font-bold mb-2">How to Play:</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Add your real-life tasks in the "Tasks" tab</li>
              <li>Complete tasks to gain experience and resources</li>
              <li>Your character will automatically travel through the wasteland</li>
              <li>Encounter traders and bandits along your journey</li>
              <li>Manage your health, energy, hunger, and thirst</li>
              <li>Complete quests to earn special rewards</li>
              <li>Reach the end of the map to win!</li>
            </ul>
            
            <h3 className="text-xl font-bold mb-2">New Features:</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Weather system</strong>: Different weather conditions affect gameplay</li>
              <li><strong>Skills system</strong>: Improve your skills in various areas</li>
              <li><strong>Foraging</strong>: Search for resources in the wilderness</li>
              <li><strong>Inventory management</strong>: Collect and use items</li>
              <li><strong>Quest system</strong>: Complete objectives for rewards</li>
            </ul>
            
            <button onClick={closeTutorial} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Start Journey
            </button>
          </div>
        </div>
      )}
      
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-center mb-2">Path Home: Post-Apocalyptic Productivity</h1>
        <p className="text-center text-gray-600">Complete real-life tasks to help your survivor journey through the wasteland</p>
      </header>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress: {Math.floor(hero.position / (world.length - 1) * 100)}%</span>
          <span>Position: {hero.position}/{world.length - 1}</span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full">
          <div 
            className="h-4 bg-blue-500 rounded-full" 
            style={{width: `${Math.floor(hero.position / (world.length - 1) * 100)}%`}}
          ></div>
        </div>
      </div>
      
      {/* Main tabs */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <button 
          onClick={() => setTab("hero")} 
          className={`py-2 px-4 rounded ${tab === "hero" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Hero
        </button>
        <button 
          onClick={() => setTab("tasks")} 
          className={`py-2 px-4 rounded ${tab === "tasks" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Tasks
        </button>
        <button 
          onClick={() => setTab("map")} 
          className={`py-2 px-4 rounded ${tab === "map" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Map
        </button>
        <button 
          onClick={() => setTab("log")} 
          className={`py-2 px-4 rounded ${tab === "log" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Log
        </button>
      </div>
      
      {/* Weather display */}
      <div className="mb-4 p-3 bg-gray-200 rounded-lg flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{weatherTypes[weatherCondition].icon}</span>
          <div>
            <div className="font-bold capitalize">{weatherCondition}</div>
            <div className="text-sm text-gray-600">{weatherTypes[weatherCondition].effect}</div>
          </div>
        </div>
        
        {currentLocation && (
          <div className="flex items-center">
            <span className="text-2xl mr-2">{getLocationIcon(currentLocation.type)}</span>
            <div>
              <div className="font-bold capitalize">{currentLocation.type}</div>
              <div className="text-sm text-gray-600">Position: {hero.position}</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Main content area */}
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        {/* Left column (game info) */}
        <div className="md:col-span-2">
          {/* Hero tab */}
          {tab === "hero" && (
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Character Stats</h2>
                <div className="text-4xl">{hero.avatar}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex justify-between">
                    <span>Health:</span>
                    <span>{Math.floor(hero.health)}/{hero.maxHealth}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                    <div 
                      className="h-2 bg-red-500 rounded-full" 
                      style={{width: `${Math.floor((hero.health / hero.maxHealth) * 100)}%`}}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between">
                    <span>Energy:</span>
                    <span>{Math.floor(hero.energy)}/{hero.maxEnergy}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                    <div 
                      className="h-2 bg-yellow-500 rounded-full" 
                      style={{width: `${Math.floor((hero.energy / hero.maxEnergy) * 100)}%`}}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between">
                    <span>Hunger:</span>
                    <span>{Math.floor(hero.hunger)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                    <div 
                      className="h-2 bg-orange-500 rounded-full" 
                      style={{width: `${Math.floor(hero.hunger)}%`}}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between">
                    <span>Thirst:</span>
                    <span>{Math.floor(hero.thirst)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                    <div 
                      className="h-2 bg-blue-500 rounded-full" 
                      style={{width: `${Math.floor(hero.thirst)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between">
                  <span>Level {hero.level}</span>
                  <span>XP: {hero.experience}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                  <div 
                    className="h-2 bg-green-500 rounded-full" 
                    style={{width: `${Math.floor((hero.experience % 100) / 100 * 100)}%`}}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-gray-100 rounded">
                  <h3 className="font-bold mb-2">Skills</h3>
                  <div className="space-y-1">
                    {Object.entries(hero.skills).map(([skill, level]) => (
                      <div key={skill} className="flex justify-between">
                        <span className="capitalize">{skill}</span>
                        <span>Lvl {level.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-3 bg-gray-100 rounded">
                  <h3 className="font-bold mb-2">Inventory</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Money:</span>
                      <span>${hero.inventory.money}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resources:</span>
                      <span>{hero.inventory.resources}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Food:</span>
                      <span>{hero.inventory.food}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Water:</span>
                      <span>{hero.inventory.water}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medkits:</span>
                      <span>{hero.inventory.medkits}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-bold mb-2">Choose Avatar</h3>
                <div className="flex flex-wrap gap-2">
                  {avatarOptions.map(avatar => (
                    <button 
                      key={avatar}
                      onClick={() => changeAvatar(avatar)}
                      className={`text-2xl p-2 border rounded hover:bg-gray-100 ${hero.avatar === avatar ? 'bg-blue-100 border-blue-500' : ''}`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button 
                  onClick={rest}
                  className="py-2 px-4 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                >
                  Rest
                </button>
                <button 
                  onClick={eat}
                  className="py-2 px-4 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  Eat
                </button>
                <button 
                  onClick={drink}
                  className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Drink
                </button>
                <button 
                  onClick={useMedkit}
                  className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Use Medkit
                </button>
                <button 
                  onClick={forage}
                  className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 col-span-full"
                >
                  Forage (-20 Energy)
                </button>
              </div>
            </div>
          )}
          
          {/* Tasks tab */}
          {tab === "tasks" && (
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Tasks</h2>
              
              <div className="mb-4 p-3 border border-gray-300 rounded">
                <h3 className="font-bold mb-2">Add New Task</h3>
                <div className="mb-3">
                  <label className="block text-sm mb-1">Task Description</label>
                  <input 
                    type="text" 
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="What do you need to do?"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm mb-1">Difficulty</label>
                    <select 
                      value={newTask.difficulty}
                      onChange={(e) => setNewTask({...newTask, difficulty: e.target.value})}
                      className="w-full p-2 border rounded"
                    >
                      <option value="1">Easy (1)</option>
                      <option value="2">Medium (2)</option>
                      <option value="3">Hard (3)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Days to Complete</label>
                    <select 
                      value={newTask.daysLeft}
                      onChange={(e) => setNewTask({...newTask, daysLeft: e.target.value})}
                      className="w-full p-2 border rounded"
                    >
                      <option value="1">1 day</option>
                      <option value="2">2 days</option>
                      <option value="3">3 days</option>
                      <option value="5">5 days</option>
                      <option value="7">7 days</option>
                    </select>
                  </div>
                </div>
                
                <button 
                  onClick={addTask}
                  className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Task
                </button>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-bold">Active Tasks</h3>
                {tasks.filter(task => !task.completed).length === 0 && (
                  <p className="text-gray-500 italic">No active tasks. Add a new task to begin your journey!</p>
                )}
                
                {tasks.filter(task => !task.completed).map(task => (
                  <div 
                    key={task.id} 
                    className={`p-3 border rounded ${getDifficultyColor(task.difficulty)}`}
                  >
                    <div className="flex justify-between mb-2">
                      <h4 className="font-bold">{task.title}</h4>
                      <div className="text-sm">
                        Difficulty: {task.difficulty} · Days: {task.daysLeft}
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm mb-3">
                      <div>
                        Rewards: {task.reward.experience} XP, {task.reward.resources} resources
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => completeTask(task.id)}
                      className="w-full py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Mark Complete
                    </button>
                  </div>
                ))}
                
                <h3 className="font-bold mt-4">Completed Tasks</h3>
                {tasks.filter(task => task.completed).length === 0 && (
                  <p className="text-gray-500 italic">No completed tasks yet.</p>
                )}
                
                {tasks.filter(task => task.completed).map(task => (
                  <div 
                    key={task.id} 
                    className="p-3 border border-gray-200 rounded bg-gray-50 opacity-70"
                  >
                    <div className="flex justify-between">
                      <h4 className="line-through">{task.title}</h4>
                      <div className="text-sm">
                        Difficulty: {task.difficulty}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      Rewarded: {task.reward.experience} XP, {task.reward.resources} resources
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Map tab */}
          {tab === "map" && (
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">World Map</h2>
              
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">
                  Current Location: {currentLocation ? `${currentLocation.type} (${hero.position}/${world.length-1})` : "Loading..."}
                </h3>
                <div>
                  <button 
                    onClick={() => setVisibleMapRange(Math.max(5, visibleMapRange - 5))}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 mr-1"
                  >
                    -
                  </button>
                  <button 
                    onClick={() => setVisibleMapRange(Math.min(30, visibleMapRange + 5))}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <div className="flex space-x-1 py-2 min-w-max">
                  {world.slice(Math.max(0, hero.position - visibleMapRange), hero.position + visibleMapRange + 1).map((location, index) => (
                    <div 
                      key={location.id} 
                      className={`w-10 h-10 flex items-center justify-center rounded-md text-sm font-bold relative 
                        ${getLocationColor(location.type)} 
                        ${location.id === hero.position ? 'ring-2 ring-white' : ''}
                        ${location.visited ? 'opacity-100' : 'opacity-50'}`}
                      title={`${location.type} (${location.id})`}
                    >
                      {location.id === hero.position && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          {hero.avatar}
                        </div>
                      )}
                      {getLocationIcon(location.type)}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="font-bold mb-2">Quest Log</h3>
                <div className="space-y-2">
                  {questLog.map(quest => (
                    <div 
                      key={quest.id} 
                      className={`p-3 border rounded ${quest.completed ? 'bg-green-100 border-green-400' : 'bg-gray-100'}`}
                    >
                      <div className="flex items-start mb-1">
                        <div className={`w-5 h-5 mr-2 flex-shrink-0 rounded-full ${quest.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div>
                          <h4 className={`font-bold ${quest.completed ? 'text-green-700' : ''}`}>{quest.title}</h4>
                          <p className="text-sm">{quest.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Log tab */}
          {tab === "log" && (
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Adventure Log</h2>
              
              <div className="space-y-2 h-96 overflow-y-auto">
                {gameLog.slice().reverse().map((log, index) => (
                  <div key={index} className={`p-2 rounded text-sm ${
                    log.type === "info" ? "bg-gray-100" :
                    log.type === "success" ? "bg-green-100" :
                    log.type === "warning" ? "bg-yellow-100" :
                    log.type === "danger" ? "bg-red-100" :
                    log.type === "trade" ? "bg-blue-100" :
                    log.type === "encounter" ? "bg-purple-100" :
                    log.type === "travel" ? "bg-indigo-100" :
                    log.type === "levelup" ? "bg-green-200" :
                    log.type === "quest" ? "bg-yellow-200" :
                    log.type === "skill" ? "bg-blue-200" :
                    log.type === "weather" ? "bg-cyan-100" :
                    "bg-gray-100"
                  }`}>
                    <div className="flex justify-between">
                      <span className="font-bold">{log.timestamp}</span>
                      <span className="capitalize text-xs">{log.type}</span>
                    </div>
                    <div>{log.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Right column (NPC encounter and actions) */}
        <div>
          {/* Encounter panel */}
          {npcEncounter && (
            <div className="bg-white p-4 rounded-lg shadow mb-4 border-2 border-yellow-400">
              <h3 className="text-xl font-bold mb-2">
                {npcEncounter === "trader" ? "Trader Encounter" :
                 npcEncounter === "bandit" ? "Bandit Encounter" : "Survivor Encounter"}
              </h3>
              
              <div className="flex items-center justify-center text-6xl my-4">
                {npcEncounter === "trader" ? "🧙‍♂️" :
                 npcEncounter === "bandit" ? "🏴‍☠️" : "🧍"}
              </div>
              
              <p className="mb-4">
                {npcEncounter === "trader" ? "A traveling merchant approaches. They offer goods in exchange for your resources." :
                 npcEncounter === "bandit" ? "A bandit blocks your path. They demand your resources and money." :
                 "A fellow survivor approaches. They look weary and hungry."}
              </p>
              
              <div className="space-y-2">
                <button 
                  onClick={trade}
                  className={`w-full py-2 rounded ${
                    npcEncounter === "trader" ? "bg-blue-500 text-white hover:bg-blue-600" :
                    npcEncounter === "bandit" ? "bg-red-500 text-white hover:bg-red-600" :
                    "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  {npcEncounter === "trader" ? "Trade Resources" :
                   npcEncounter === "bandit" ? "Defend Yourself" :
                   "Share Supplies"}
                </button>
                
                <button 
                  onClick={() => setNpcEncounter(null)}
                  className="w-full py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  {npcEncounter === "trader" ? "Decline Trade" :
                   npcEncounter === "bandit" ? "Try to Run Away" :
                   "Walk Away"}
                </button>
              </div>
            </div>
          )}
          
          {/* Stats panel */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-3">Stats</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tasks Completed:</span>
                <span>{tasks.filter(task => task.completed).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Distance Traveled:</span>
                <span>{hero.traveledDistance.toFixed(1)}km</span>
              </div>
              <div className="flex justify-between">
                <span>Current Level:</span>
                <span>{hero.level}</span>
              </div>
              <div className="flex justify-between">
                <span>Quests Completed:</span>
                <span>{questLog.filter(q => q.completed).length}/{questLog.length}</span>
              </div>
            </div>
            
            <hr className="my-3" />
            
            <h3 className="text-lg font-bold mb-3">Character Traits</h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between">
                  <span>Charisma:</span>
                  <span>{hero.charisma.toFixed(1)}/10</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                  <div 
                    className="h-2 bg-pink-500 rounded-full" 
                    style={{width: `${Math.floor((hero.charisma / 10) * 100)}%`}}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between">
                  <span>Luck:</span>
                  <span>{hero.luck.toFixed(1)}/10</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                  <div 
                    className="h-2 bg-green-500 rounded-full" 
                    style={{width: `${Math.floor((hero.luck / 10) * 100)}%`}}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between">
                  <span>Morality:</span>
                  <span>{hero.morality.toFixed(1)}/10</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                  <div 
                    className="h-2 bg-blue-500 rounded-full" 
                    style={{width: `${Math.floor((hero.morality / 10) * 100)}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="text-center text-gray-500 text-sm mt-auto pt-4">
        Path Home: Post-Apocalyptic Productivity - Gamify your real-world tasks in a post-apocalyptic adventure!
      </footer>
    </div>
  );
};

export default ProductivityApocalypse;