# ruimte_snake_game.py (voor PyScript integratie)
# Unieke Snake-variant met ruimte-thema - Webvriendelijk (geen bestands-IO)

import pygame
import random
import math
import js

WIDTH, HEIGHT = 800, 600
GRID_SIZE = 20
FPS = 15
LEVELS = 5

ZWART = (0, 0, 0)
WIT = (255, 255, 255)
GROEN = (0, 255, 0)
ROOD = (255, 0, 0)
BLAUW = (0, 0, 255)
GEEL = (255, 255, 0)
PAARS = (200, 0, 200)

class Snake:
    def __init__(self):
        self.segments = [(5, 5)]
        self.direction = (1, 0)
        self.groei = 0
        self.hyperdrive = 0
        self.shield = 0

    def move(self):
        head = self.segments[0]
        new_head = (head[0] + self.direction[0], head[1] + self.direction[1])
        self.segments.insert(0, new_head)
        if self.groei > 0:
            self.groei -= 1
        else:
            self.segments.pop()

class Voedsel:
    def __init__(self):
        self.pos = (random.randint(0, WIDTH // GRID_SIZE - 1), random.randint(0, HEIGHT // GRID_SIZE - 1))
        self.type = random.choice(['normaal', 'snel', 'traag', 'schild'])

class Asteroide:
    def __init__(self):
        self.pos = [random.randint(0, WIDTH // GRID_SIZE - 1), random.randint(0, HEIGHT // GRID_SIZE - 1)]
        self.dir = [random.choice([-1, 1]), random.choice([-1, 1])]

    def move(self):
        if random.random() < 0.1:
            self.dir = [random.choice([-1, 0, 1]), random.choice([-1, 0, 1])]
        self.pos[0] = (self.pos[0] + self.dir[0]) % (WIDTH // GRID_SIZE)
        self.pos[1] = (self.pos[1] + self.dir[1]) % (HEIGHT // GRID_SIZE)

def draw_grid(screen):
    for x in range(0, WIDTH, GRID_SIZE):
        pygame.draw.line(screen, (40, 40, 40), (x, 0), (x, HEIGHT))
    for y in range(0, HEIGHT, GRID_SIZE):
        pygame.draw.line(screen, (40, 40, 40), (0, y), (WIDTH, y))

def teken_voedsel(screen, voedsel):
    kleur = {'normaal': GROEN, 'snel': ROOD, 'traag': BLAUW, 'schild': GEEL}[voedsel.type]
    rect = pygame.Rect(voedsel.pos[0]*GRID_SIZE, voedsel.pos[1]*GRID_SIZE, GRID_SIZE, GRID_SIZE)
    pygame.draw.rect(screen, kleur, rect)

def teken_asteroide(screen, a):
    rect = pygame.Rect(a.pos[0]*GRID_SIZE, a.pos[1]*GRID_SIZE, GRID_SIZE, GRID_SIZE)
    pygame.draw.circle(screen, (100, 100, 100), rect.center, GRID_SIZE // 2)

def save_highscore(score):
    storage = js.window.localStorage
    high = int(storage.getItem("highscore") or 0)
    if score > high:
        storage.setItem("highscore", str(score))
        return True
    return False

def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("Ruimte Snake")
    clock = pygame.time.Clock()
    font = pygame.font.SysFont(None, 36)

    snake = Snake()
    voedsel = Voedsel()
    asteroiden = [Asteroide() for _ in range(5)]

    punten = 0
    level = 1
    frames_per_second = FPS
    running = True
    bericht = "Gebruik pijltjestoetsen of WASD!"

    while running:
        screen.fill(ZWART)
        draw_grid(screen)

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                keys = {
                    pygame.K_UP: (0, -1), pygame.K_w: (0, -1),
                    pygame.K_DOWN: (0, 1), pygame.K_s: (0, 1),
                    pygame.K_LEFT: (-1, 0), pygame.K_a: (-1, 0),
                    pygame.K_RIGHT: (1, 0), pygame.K_d: (1, 0)
                }
                if event.key in keys:
                    new_dir = keys[event.key]
                    if (new_dir[0] != -snake.direction[0] or new_dir[1] != -snake.direction[1]):
                        snake.direction = new_dir

        snake.move()
        head = snake.segments[0]

        if head == voedsel.pos:
            punten += 10 * (2 if snake.hyperdrive > 0 else 1)
            snake.groei += 1
            if voedsel.type == 'snel':
                frames_per_second += 5
            elif voedsel.type == 'traag':
                frames_per_second = max(FPS, frames_per_second - 3)
            elif voedsel.type == 'schild':
                snake.shield = 100
            voedsel = Voedsel()
            if punten % 50 == 0:
                snake.hyperdrive = 100
                bericht = "Hyperdrive actief!"

        for a in asteroiden:
            a.move()
            if a.pos == head and snake.shield == 0 and snake.hyperdrive == 0:
                bericht = "Gebotst met asteroïde!"
                running = False

        if head in snake.segments[1:] and snake.shield == 0 and snake.hyperdrive == 0:
            bericht = "Je hebt jezelf geraakt!"
            running = False

        for segment in snake.segments:
            rect = pygame.Rect(segment[0]*GRID_SIZE, segment[1]*GRID_SIZE, GRID_SIZE, GRID_SIZE)
            kleur = PAARS if snake.hyperdrive > 0 else WIT
            pygame.draw.rect(screen, kleur, rect)

        teken_voedsel(screen, voedsel)
        for a in asteroiden:
            teken_asteroide(screen, a)

        if snake.shield > 0: snake.shield -= 1
        if snake.hyperdrive > 0: snake.hyperdrive -= 1

        if punten > 0 and punten % 100 == 0:
            level = min(LEVELS, punten // 100 + 1)
            frames_per_second = FPS + (level * 2)
            if len(asteroiden) < level * 2:
                asteroiden.append(Asteroide())

        screen.blit(font.render(f"Score: {punten} | Level: {level}", True, WIT), (10, 10))
        screen.blit(font.render(bericht, True, GEEL), (10, 40))

        pygame.display.flip()
        clock.tick(frames_per_second)

    nieuw_record = save_highscore(punten)
    print("Nieuwe highscore!" if nieuw_record else "Einde spel.")
    pygame.quit()

main()
