import hashlib
NUM_WORDS = 3

def max_int_from_string(string, max_val, current_value=''):
  if len(string) == 0:
    return int(current_value), string
  if int(current_value + string[0]) > max_val:
    return int(current_value), string

  return max_int_from_string(string[1:], max_val, current_value=current_value + string[0])

file_path = "/usr/share/dict/words"
words = []
with open(file_path, 'r') as infile:
  for line in infile:
    words.append(line.rstrip("\n"))

num_words = len(words)
hex_digest = hashlib.sha1(b'Hey guys').hexdigest()
int_digest = str(int(hex_digest, 16))
hash_words = []

while len(hash_words) < NUM_WORDS:
  word_num, int_digest = max_int_from_string(int_digest, num_words)
  hash_words.append(words[word_num])

print(hash_words)
