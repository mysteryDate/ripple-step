import os
import hasher
import random

# TEST_SIZE = 10**9 # 1 BILLION!!
TEST_SIZE = 10**6
animation = "|/-\\"
attempt_num = -1
offset = random.randint(0, TEST_SIZE)
print(offset)
collision_dict = {}
num_collisions = 0
results = set()

dict_file = "word_list_larger.txt"
dictionary_words = []
with open(dict_file, 'r') as infile:
  for line in infile:
    dictionary_words.append(line.rstrip("\n"))

while attempt_num < TEST_SIZE:
    attempt_num += 1
    randints = [random.randint(0, len(dictionary_words)) for _ in range(3)]
    to_hash = attempt_num + offset
    hash, word_indeces = hasher.hash_to_words(str(attempt_num + offset), num_words=4, dictionary=dictionary_words)
    if hash in results:
      num_collisions += 1
      print("collision on {i}th attempt!! {w}".format(i=attempt_num, w=hash) + " "*20)
    results.add(hash)
    to_print = animation[attempt_num % len(animation)] + " {i}th attempt: {w}".format(i=attempt_num, w=hash)
    print(to_print, end="\r")

print("Num collisions: {}".format(num_collisions) + " "*20)
