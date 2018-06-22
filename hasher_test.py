import time
import os
import hasher
import random

# TEST_SIZE = 10**9 # 1 BILLION!!
TEST_SIZE = 10**6
animation = "|/-\\"
attempt_num = -1
results = set()
offset = random.randint(0, TEST_SIZE)
collision_dict = {}
print(offset)
num_collisions = 0

dict_file = "word_list.txt"
dictionary_words = []
with open(dict_file, 'r') as infile:
  for line in infile:
    dictionary_words.append(line.rstrip("\n"))

index_frequency = [0] * (len(dictionary_words)**3)
by_first = {}

while attempt_num < TEST_SIZE:
    attempt_num += 1
    randints = [random.randint(0, len(dictionary_words)) for _ in range(3)]
    # hash = '-'.join([str(x) for x in randints])
    hash = random.randint(0, len(dictionary_words) ** 3)
    index_frequency[hash] += 1
    to_hash = attempt_num + offset
    # hash, word_indeces = hasher.hash_to_words(str(attempt_num + offset), num_words=3, dictionary=dictionary_words)
    # if word_indeces[0] in by_first:
    #   by_first[word_indeces[0]].append(word_indeces[1:])
    # else:
    #   by_first[word_indeces[0]] = [word_indeces[1:]]
    # for index in word_indeces:
    #   index_frequency[index] += 1
    if hash in results:
      num_collisions += 1
      # results[hash].append(to_hash)
      # print("collision on {i}th attempt!! {w}".format(i=attempt_num, w=hash) + " "*20)
      # print(results[hash])
    #   if hash in collision_dict:
    #     collision_dict[hash] += 1
    #   else:
    #     collision_dict[hash] = 2
    #   continue
    # results[hash] = [to_hash]
    results.add(hash)
    to_print = animation[attempt_num % len(animation)] + " {i}th attempt: {w}".format(i=attempt_num, w=hash)
    print(to_print, end="\r")

print("Num collisions: {}".format(num_collisions) + " "*20)
